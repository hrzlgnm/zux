mod mdns;

use std::sync::Mutex;
use std::time::Duration;

#[cfg(desktop)]
use clap::Parser;
use log::LevelFilter;
use mdns::{MdnsBrowser, MdnsEvent};
use tauri::{Emitter, State};
use tauri_plugin_log::{Target, TargetKind};

const EMIT_BATCH_SIZE: usize = 1;
const EMIT_BATCH_INTERVAL: Duration = Duration::from_millis(50);

#[cfg(desktop)]
use tauri::utils::platform::bundle_type;

#[cfg(desktop)]
fn parse_log_level(s: &str) -> LevelFilter {
    match s.to_lowercase().as_str() {
        "trace" => LevelFilter::Trace,
        "debug" => LevelFilter::Debug,
        "info" => LevelFilter::Info,
        "warn" => LevelFilter::Warn,
        "error" => LevelFilter::Error,
        _ => LevelFilter::Info,
    }
}

#[cfg(desktop)]
#[derive(Parser)]
#[command(
    name = "zux",
    about = "mDNS-SD visualizer with force-directed graph",
    version
)]
struct Cli {
    // Disabled by default so the graph does not leak your public IPv6 address
    /// Include non-link-local IPv6 addresses (global and ULA)
    #[arg(short = 'I', long)]
    include_non_link_local_ipv6: bool,
    /// Log level (trace, debug, info, warn, error) [default: info]
    #[arg(long, default_value = "info")]
    log_level: String,
    /// Log to file in the OS-specific log directory
    #[arg(long)]
    log_to_file: bool,
    #[cfg(target_os = "linux")]
    /// Disable dmabuf renderer, useful when having rendering issues
    #[arg(short = 'd', long)]
    disable_dmabuf_renderer: bool,
    #[cfg(target_os = "linux")]
    /// Disable NVIDIA explicit sync even if NVIDIA is not detected
    #[arg(short = 'e', long)]
    disable_nv_explicit_sync: bool,
    #[cfg(target_os = "linux")]
    /// Disable all NVIDIA workarounds entirely
    #[arg(short = 'n', long)]
    no_nvidia_workaround: bool,
    #[cfg(target_os = "linux")]
    /// Print diagnostic notes when applying an NVIDIA workaround
    #[arg(short = 'v', long)]
    nvidia_workaround_verbose: bool,
}

#[tauri::command]
fn save_text_file(path: String, contents: String) -> Result<(), String> {
    log::debug!("save_text_file called");
    std::fs::write(&path, contents).map_err(|e| {
        log::error!("write error for {path}: {e}");
        e.to_string()
    })
}

#[cfg(desktop)]
#[tauri::command]
fn can_auto_update() -> bool {
    let current_bundle_type = bundle_type();
    if current_bundle_type.is_none() {
        log::debug!("non-bundled version, auto-update disabled");
        return false;
    }
    true
}

#[cfg(mobile)]
#[tauri::command]
fn can_auto_update() -> bool {
    if tauri::is_dev() || cfg!(debug_assertions) {
        log::debug!("dev/debug build, auto-update disabled");
        return false;
    }
    true
}

#[tauri::command]
async fn start_discovery(
    app: tauri::AppHandle,
    state: State<'_, Mutex<MdnsBrowser>>,
) -> Result<(), String> {
    log::debug!("start_discovery called");
    let mut browser = state.lock().map_err(|e| {
        log::error!("lock error: {e}");
        e.to_string()
    })?;
    browser.reset().map_err(|e| {
        log::error!("reset error: {e}");
        e.to_string()
    })?;
    let mut rx = browser.subscribe();
    let app_clone = app.clone();

    tokio::spawn(async move {
        log::debug!("event listener started");
        let mut pending: Vec<MdnsEvent> = Vec::new();
        let mut timer = tokio::time::interval(EMIT_BATCH_INTERVAL);
        timer.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Delay);
        timer.tick().await;
        loop {
            tokio::select! {
                result = rx.recv() => match result {
                    Ok(event) => {
                        coalesce_event(&mut pending, event);
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Lagged(n)) => {
                        log::warn!("lagged behind {n} events, continuing");
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                        log::debug!("event listener ended");
                        emit_batch(&app_clone, &mut pending);
                        break;
                    }
                },
                _ = timer.tick() => emit_batch(&app_clone, &mut pending),
            }
        }
    });

    browser.start().map_err(|e| {
        log::error!("start error: {e}");
        e.to_string()
    })?;
    Ok(())
}

fn coalesce_event(pending: &mut Vec<MdnsEvent>, event: MdnsEvent) {
    match event {
        MdnsEvent::Added(svc) => {
            let id = svc.id.clone();
            pending.retain(|e| match e {
                MdnsEvent::Added(s) => s.id != id,
                MdnsEvent::Removed { id: r_id, .. } => r_id.as_str() != id.as_str(),
                MdnsEvent::TypeAdded { .. } => true,
            });
            pending.push(MdnsEvent::Added(svc));
        }
        MdnsEvent::Removed {
            id, service_type, ..
        } => {
            let is_pending_add = pending
                .iter()
                .any(|e| matches!(e, MdnsEvent::Added(s) if s.id == id));
            pending.retain(|e| !matches!(e, MdnsEvent::Added(s) if s.id == id));
            if !is_pending_add {
                pending.push(MdnsEvent::Removed { id, service_type });
            }
        }
        MdnsEvent::TypeAdded { service_type } => {
            if !pending.iter().any(
                |e| matches!(e, MdnsEvent::TypeAdded { service_type: st } if st == &service_type),
            ) {
                pending.push(MdnsEvent::TypeAdded { service_type });
            }
        }
    }
}

fn emit_batch(app: &tauri::AppHandle, pending: &mut Vec<MdnsEvent>) {
    if pending.is_empty() {
        return;
    }
    let take = pending.len().min(EMIT_BATCH_SIZE);
    let events: Vec<MdnsEvent> = pending.drain(..take).collect();
    log::debug!("emitting {} events to frontend", events.len());
    if let Err(e) = app.emit("mdns-event", &events) {
        log::error!("emit error: {e}");
    }
}

/// Creates the main application window.
///
/// The window is created programmatically (rather than via `tauri.conf.json`)
/// so its decoration state can be decided at creation time, which is the only
/// point at which it reliably takes effect: Wayland/GTK and X11 do not honor
/// runtime decoration changes once the window is mapped. Tiling Wayland
/// compositors therefore start borderless, while every other session starts
/// decorated.
///
/// On non-tiling Wayland the minimize/maximize/close buttons are dead after the
/// window is created hidden and shown, unless the window is created maximized:
/// a creation-time reconfigure wires the buttons up, avoiding any runtime
/// toggle/cycle.
#[cfg(desktop)]
fn create_main_window(
    app: &tauri::AppHandle,
) -> Result<tauri::WebviewWindow, Box<dyn std::error::Error>> {
    #[cfg(target_os = "linux")]
    let wayland = webkit2gtk_nvidia_quirk::is_wayland_session();
    #[cfg(target_os = "linux")]
    let tiling = webkit2gtk_nvidia_quirk::is_tiling_compositor();
    #[cfg(target_os = "linux")]
    let decorate = !(wayland && tiling);
    #[cfg(target_os = "linux")]
    let start_maximized = wayland && !tiling;
    #[cfg(not(target_os = "linux"))]
    let decorate = true;
    #[cfg(not(target_os = "linux"))]
    let start_maximized = false;

    let mut builder =
        tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::App("index.html".into()))
            .title("zux — mDNS-SD Visualizer")
            .inner_size(1200.0, 800.0)
            .decorations(decorate)
            .visible(false);
    if start_maximized {
        builder = builder.maximized(true);
    }
    let window = builder.build().map_err(|e| {
        log::error!("Failed to create main window: {e}");
        Box::new(e) as Box<dyn std::error::Error>
    })?;
    window.show().map_err(|e| {
        log::error!("Failed to show main window: {e}");
        Box::new(e) as Box<dyn std::error::Error>
    })?;
    Ok(window)
}

#[cfg(desktop)]
pub fn run() {
    let cli = Cli::parse();
    let level = parse_log_level(&cli.log_level);

    #[cfg(target_os = "linux")]
    {
        if !cli.no_nvidia_workaround {
            let options = webkit2gtk_nvidia_quirk::ApplyWorkaroundOptions::default()
                .force_disable_dmabuf(cli.disable_dmabuf_renderer)
                .force_disable_nv_explicit_sync(cli.disable_nv_explicit_sync)
                .verbose(cli.nvidia_workaround_verbose);
            webkit2gtk_nvidia_quirk::apply_workaround_with_options(options);
        }
    }

    let mut log_builder = tauri_plugin_log::Builder::new()
        .level(level)
        .clear_targets()
        .target(Target::new(TargetKind::Stdout));

    if cli.log_to_file {
        log_builder = log_builder.target(Target::new(TargetKind::LogDir { file_name: None }));
    }

    let browser =
        MdnsBrowser::new(!cli.include_non_link_local_ipv6).expect("failed to create mDNS browser");

    tauri::Builder::default()
        .plugin(log_builder.build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(Mutex::new(browser))
        .invoke_handler(tauri::generate_handler![
            start_discovery,
            can_auto_update,
            save_text_file
        ])
        .setup(|app| {
            // The main window is created programmatically (instead of via
            // tauri.conf.json) so its decoration state can be set at creation
            // time. Runtime decoration changes do not take effect on
            // Wayland/GTK (and X11) once the window is mapped, so tiling
            // Wayland compositors must start borderless from the start.
            create_main_window(app.handle())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(mobile)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run_mobile() {
    let browser = MdnsBrowser::new(false).expect("failed to create mDNS browser");

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(LevelFilter::Info)
                .clear_targets()
                .target(Target::new(TargetKind::Stdout))
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_android_update::Builder::new()
                .owner("hrzlgnm")
                .repo("zux")
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(Mutex::new(browser))
        .invoke_handler(tauri::generate_handler![
            start_discovery,
            can_auto_update,
            save_text_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
