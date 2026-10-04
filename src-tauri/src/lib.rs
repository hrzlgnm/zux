use serde::Serialize;

#[cfg(desktop)]
use clap::Parser;
use log::LevelFilter;
use tauri::State;
use tauri_plugin_log::{Target, TargetKind};

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

/// Discovery options derived from the CLI; the mDNS engine itself lives in
/// `tauri-plugin-mdns`, so only the address-visibility flag remains here.
#[derive(Clone, Serialize, Debug, PartialEq)]
struct DiscoveryConfig {
    link_local_only: bool,
}

/// Reports whether non-link-local IPv6 addresses should be hidden from the
/// graph. The frontend filters resolved addresses with this flag, preserving
/// the `-I/--include-non-link-local-ipv6` default of leaking no public IPv6.
#[tauri::command]
fn link_local_only(config: State<'_, DiscoveryConfig>) -> bool {
    config.link_local_only
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
        .target(Target::new(TargetKind::Stdout))
        .target(Target::new(TargetKind::Webview));

    if cli.log_to_file {
        log_builder = log_builder.target(Target::new(TargetKind::LogDir { file_name: None }));
    }

    tauri::Builder::default()
        .plugin(log_builder.build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_mdns::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(DiscoveryConfig {
            link_local_only: !cli.include_non_link_local_ipv6,
        })
        .invoke_handler(tauri::generate_handler![
            link_local_only,
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
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(LevelFilter::Info)
                .clear_targets()
                .target(Target::new(TargetKind::Stdout))
                .target(Target::new(TargetKind::Webview))
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_mdns::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_android_update::Builder::new()
                .owner("hrzlgnm")
                .repo("zux")
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(DiscoveryConfig {
            link_local_only: false,
        })
        .invoke_handler(tauri::generate_handler![
            link_local_only,
            can_auto_update,
            save_text_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
