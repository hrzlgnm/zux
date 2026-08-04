mod mdns;

#[cfg(desktop)]
use clap::Parser;
use log::LevelFilter;
use mdns::MdnsBrowser;
use std::sync::Mutex;
use tauri::{Emitter, State};
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
        loop {
            match rx.recv().await {
                Ok(event) => {
                    log::debug!("forwarding event to frontend");
                    if let Err(e) = app_clone.emit("mdns-event", &event) {
                        log::error!("emit error: {e}");
                    }
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(n)) => {
                    log::warn!("lagged behind {n} events, continuing");
                }
                Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                    log::debug!("event listener ended");
                    break;
                }
            }
        }
    });

    browser.start().map_err(|e| {
        log::error!("start error: {e}");
        e.to_string()
    })?;
    Ok(())
}

#[cfg(desktop)]
pub fn run() {
    let cli = Cli::parse();
    let level = parse_log_level(&cli.log_level);

    #[cfg(target_os = "linux")]
    {
        webkit2gtk_nvidia_quirk::apply_workaround_with_options(
            webkit2gtk_nvidia_quirk::ApplyWorkaroundOptions::default(),
        );
    }

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
        .invoke_handler(tauri::generate_handler![
            start_discovery,
            can_auto_update,
            save_text_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(mobile)]
mod autoupdate {
    use serde::Serialize;
    use std::sync::Mutex;
    use tauri::{AppHandle, State};
    use tauri_plugin_http::reqwest;
    use tauri_plugin_opener::OpenerExt;

    const LATEST_JSON_URL: &str =
        "https://github.com/hrzlgnm/zux/releases/latest/download/latest.json";
    const GITHUB_RELEASES_URL: &str = "https://github.com/hrzlgnm/zux/releases/latest";

    #[derive(Clone, Serialize, Debug, PartialEq)]
    #[serde(rename_all = "camelCase")]
    pub struct UpdateMetadata {
        pub version: String,
        pub current_version: String,
    }

    #[derive(Clone)]
    pub struct PendingUpdate {
        pub version: String,
    }

    pub struct PendingUpdateInfo(pub Mutex<Option<PendingUpdate>>);

    #[derive(serde::Deserialize)]
    struct LatestJson {
        version: String,
    }

    #[tauri::command]
    pub async fn fetch_update(
        app: AppHandle,
        pending_update: State<'_, PendingUpdateInfo>,
    ) -> Result<Option<UpdateMetadata>, String> {
        let body = reqwest::get(LATEST_JSON_URL)
            .await
            .map_err(|e| {
                log::error!("[updater] failed to fetch latest release info: {e}");
                format!("failed to fetch latest release info: {e}")
            })?
            .text()
            .await
            .map_err(|e| {
                log::error!("[updater] failed to read latest release info: {e}");
                format!("failed to read latest release info: {e}")
            })?;
        let latest_json: LatestJson = serde_json::from_str(&body).map_err(|e| {
            log::error!("[updater] failed to parse latest release info: {e}");
            format!("failed to parse latest release info: {e}")
        })?;
        let latest_version = latest_json.version.trim_start_matches('v').to_string();
        let current_version = app.package_info().version.to_string();

        if latest_version == current_version {
            log::info!("[updater] app is up to date ({current_version})");
            *pending_update.0.lock().expect("To lock") = None;
            return Ok(None);
        }

        log::info!("[updater] update {latest_version} found");
        *pending_update.0.lock().expect("To lock") = Some(PendingUpdate {
            version: latest_version.clone(),
        });

        Ok(Some(UpdateMetadata {
            version: latest_version,
            current_version,
        }))
    }

    #[tauri::command]
    pub async fn install_update(
        app: AppHandle,
        pending_update: State<'_, PendingUpdateInfo>,
    ) -> Result<(), String> {
        let pending = pending_update
            .0
            .lock()
            .expect("To lock")
            .as_ref()
            .cloned()
            .ok_or_else(|| "there is no pending update".to_string())?;

        let releases_url = GITHUB_RELEASES_URL;
        log::info!(
            "[updater] opening releases page for update {}: {}",
            pending.version,
            releases_url
        );
        app.opener()
            .open_url(releases_url.to_string(), None::<String>)
            .map_err(|e| {
                log::error!("[updater] failed to open releases page: {e:?}");
                format!("failed to open releases page: {e:?}")
            })?;

        log::info!("[updater] releases page opened, user can download APK manually");
        Ok(())
    }
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
        .plugin(tauri_plugin_http::init())
        .manage(Mutex::new(browser))
        .manage(autoupdate::PendingUpdateInfo(std::sync::Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            start_discovery,
            can_auto_update,
            save_text_file,
            autoupdate::fetch_update,
            autoupdate::install_update
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
