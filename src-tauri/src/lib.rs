mod mdns;

use mdns::MdnsBrowser;
use std::sync::Arc;
use tauri::{Emitter, State};

struct AppState {
    browser: Arc<MdnsBrowser>,
}

#[tauri::command]
async fn start_discovery(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    eprintln!("[tauri] start_discovery called");
    let mut rx = state.browser.subscribe();
    let app_clone = app.clone();

    tokio::spawn(async move {
        eprintln!("[tauri] event listener started");
        while let Ok(event) = rx.recv().await {
            eprintln!("[tauri] forwarding event to frontend");
            if let Err(e) = app_clone.emit("mdns-event", &event) {
                eprintln!("[tauri] emit error: {e}");
            }
        }
        eprintln!("[tauri] event listener ended");
    });

    state.browser.start().map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let browser = MdnsBrowser::new().expect("failed to create mDNS browser");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            browser: Arc::new(browser),
        })
        .invoke_handler(tauri::generate_handler![start_discovery])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
