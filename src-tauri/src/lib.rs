mod mdns;

use clap::Parser;
use mdns::MdnsBrowser;
use std::sync::Mutex;
use tauri::{Emitter, State};

#[derive(Parser)]
#[command(name = "zux", about = "mDNS-SD browser with force-directed graph")]
struct Cli {
    /// Keep all IP addresses including non-link-local IPv6
    #[arg(long)]
    keep_all_ips: bool,
}

#[tauri::command]
async fn start_discovery(
    app: tauri::AppHandle,
    state: State<'_, Mutex<MdnsBrowser>>,
) -> Result<(), String> {
    log::info!("[tauri] start_discovery called");
    let mut browser = state.lock().map_err(|e| { log::error!("[tauri] lock error: {e}"); e.to_string() })?;
    browser.reset().map_err(|e| { log::error!("[tauri] reset error: {e}"); e.to_string() })?;
    let mut rx = browser.subscribe();
    let app_clone = app.clone();

    tokio::spawn(async move {
        log::info!("[tauri] event listener started");
        while let Ok(event) = rx.recv().await {
            log::info!("[tauri] forwarding event to frontend");
            if let Err(e) = app_clone.emit("mdns-event", &event) {
                log::error!("[tauri] emit error: {e}");
            }
        }
        log::info!("[tauri] event listener ended");
    });

    browser.start().map_err(|e| { log::error!("[tauri] start error: {e}"); e.to_string() })?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let cli = Cli::parse();
    let browser = MdnsBrowser::new(!cli.keep_all_ips).expect("failed to create mDNS browser");

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(browser))
        .invoke_handler(tauri::generate_handler![start_discovery])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
