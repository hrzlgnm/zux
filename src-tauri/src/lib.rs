mod mdns;

#[cfg(desktop)]
use clap::Parser;
use log::LevelFilter;
use mdns::MdnsBrowser;
use std::sync::Mutex;
use tauri::utils::platform::bundle_type;
use tauri::{Emitter, State};
use tauri_plugin_log::{Target, TargetKind};

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
    /// Keep all IP addresses including non-link-local IPv6
    #[arg(long)]
    keep_all_ips: bool,
    /// Log level (trace, debug, info, warn, error) [default: info]
    #[arg(long, default_value = "info")]
    log_level: String,
    /// Log to file in the OS-specific log directory
    #[arg(long)]
    log_to_file: bool,
}

#[tauri::command]
fn can_auto_update() -> bool {
    let current_bundle_type = bundle_type();
    if current_bundle_type.is_none() {
        log::debug!("[updater] non-bundled version, auto-update disabled");
        return false;
    }
    true
}

#[tauri::command]
async fn start_discovery(
    app: tauri::AppHandle,
    state: State<'_, Mutex<MdnsBrowser>>,
) -> Result<(), String> {
    log::debug!("[tauri] start_discovery called");
    let mut browser = state.lock().map_err(|e| {
        log::error!("[tauri] lock error: {e}");
        e.to_string()
    })?;
    browser.reset().map_err(|e| {
        log::error!("[tauri] reset error: {e}");
        e.to_string()
    })?;
    let mut rx = browser.subscribe();
    let app_clone = app.clone();

    tokio::spawn(async move {
        log::debug!("[tauri] event listener started");
        loop {
            match rx.recv().await {
                Ok(event) => {
                    log::debug!("[tauri] forwarding event to frontend");
                    if let Err(e) = app_clone.emit("mdns-event", &event) {
                        log::error!("[tauri] emit error: {e}");
                    }
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(n)) => {
                    log::warn!("[tauri] lagged behind {n} events, continuing");
                }
                Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                    log::debug!("[tauri] event listener ended");
                    break;
                }
            }
        }
    });

    browser.start().map_err(|e| {
        log::error!("[tauri] start error: {e}");
        e.to_string()
    })?;
    Ok(())
}

#[cfg(desktop)]
pub fn run() {
    let cli = Cli::parse();
    let level = parse_log_level(&cli.log_level);

    let mut log_builder = tauri_plugin_log::Builder::new()
        .level(level)
        .clear_targets()
        .target(Target::new(TargetKind::Stdout));

    if cli.log_to_file {
        log_builder = log_builder.target(Target::new(TargetKind::LogDir { file_name: None }));
    }

    let browser = MdnsBrowser::new(!cli.keep_all_ips).expect("failed to create mDNS browser");

    tauri::Builder::default()
        .plugin(log_builder.build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(Mutex::new(browser))
        .invoke_handler(tauri::generate_handler![start_discovery, can_auto_update])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(mobile)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run_mobile() {
    let browser = MdnsBrowser::new(true).expect("failed to create mDNS browser");

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
        .manage(Mutex::new(browser))
        .invoke_handler(tauri::generate_handler![start_discovery, can_auto_update])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
