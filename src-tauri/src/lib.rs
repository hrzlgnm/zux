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

#[cfg(any(mobile, test))]
fn compare_versions(
    fetched: &str,
    current: &str,
) -> Result<std::cmp::Ordering, Box<dyn std::error::Error>> {
    let fetched = semver::Version::parse(fetched.strip_prefix('v').unwrap_or(fetched))?;
    let current = semver::Version::parse(current)?;
    Ok(fetched.cmp(&current))
}

#[cfg(mobile)]
mod autoupdate {
    use serde::Serialize;
    use std::sync::Mutex;
    use tauri::{AppHandle, State};
    use tauri_plugin_opener::OpenerExt;

    use crate::compare_versions;

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

        let ordering = compare_versions(&latest_json.version, &current_version).map_err(|e| {
            log::error!("[updater] failed to compare release versions: {e}");
            format!("failed to compare release versions: {e}")
        })?;

        match ordering {
            std::cmp::Ordering::Greater => {
                log::info!("[updater] update {latest_version} found");
                *pending_update.0.lock().expect("To lock") = Some(PendingUpdate {
                    version: latest_version.clone(),
                });
                Ok(Some(UpdateMetadata {
                    version: latest_version,
                    current_version,
                }))
            }
            _ => {
                log::info!("[updater] app is up to date ({current_version})");
                *pending_update.0.lock().expect("To lock") = None;
                Ok(None)
            }
        }
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

#[cfg(test)]
mod tests {
    use super::compare_versions;
    use std::cmp::Ordering;

    #[test]
    fn fetched_version_older_than_installed_is_not_an_update() {
        assert_eq!(compare_versions("1.9.0", "2.0.0").unwrap(), Ordering::Less);
    }

    #[test]
    fn fetched_version_equal_to_installed_is_not_an_update() {
        assert_eq!(compare_versions("2.0.0", "2.0.0").unwrap(), Ordering::Equal);
    }

    #[test]
    fn fetched_version_newer_than_installed_is_an_update() {
        assert_eq!(
            compare_versions("2.0.1", "2.0.0").unwrap(),
            Ordering::Greater
        );
        assert_eq!(
            compare_versions("v2.0.1", "2.0.0").unwrap(),
            Ordering::Greater
        );
    }

    #[test]
    fn fetched_version_malformed_is_rejected() {
        assert!(compare_versions("not-a-version", "2.0.0").is_err());
        assert!(compare_versions("vv2.0.1", "2.0.0").is_err());
    }
}
