use mdns_sd::{IfKind, ResolvedService, ScopedIp, ServiceDaemon, ServiceEvent};
use serde::Serialize;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;
use url::Url;

const EVENT_CHANNEL_CAPACITY: usize = 8192;

#[derive(Clone, Serialize, Debug, PartialEq)]
pub struct AddressInfo {
    pub ip: String,
    pub interfaces: Vec<String>,
}

#[derive(Clone, Serialize, Debug, PartialEq)]
pub struct ServiceDiscovered {
    pub id: String,
    pub name: String,
    pub service_type: String,
    pub sub_type: Option<String>,
    pub hostname: String,
    pub port: u16,
    pub addresses: Vec<AddressInfo>,
    pub txt: HashMap<String, String>,
    pub urls: Vec<String>,
}

#[derive(Clone, Serialize, Debug)]
#[serde(tag = "type", content = "data")]
pub enum MdnsEvent {
    #[serde(rename = "service-added")]
    Added(ServiceDiscovered),
    #[serde(rename = "service-removed")]
    Removed { id: String, service_type: String },
    #[serde(rename = "service-type-added")]
    TypeAdded { service_type: String },
}

pub struct MdnsBrowser {
    daemon: Option<ServiceDaemon>,
    tx: broadcast::Sender<MdnsEvent>,
    active_browses: Arc<Mutex<HashMap<String, bool>>>,
    seen_instances: Arc<Mutex<HashMap<String, ServiceDiscovered>>>,
    filter_non_link_local: bool,
}

impl MdnsBrowser {
    fn configure_daemon(daemon: &ServiceDaemon) -> Result<(), Box<dyn std::error::Error>> {
        daemon.set_ip_check_interval(1)?;
        daemon.disable_interface(IfKind::LoopbackV4)?;
        daemon.disable_interface(IfKind::LoopbackV6)?;
        Ok(())
    }

    pub fn new(filter_non_link_local: bool) -> Result<Self, Box<dyn std::error::Error>> {
        let (tx, _) = broadcast::channel(EVENT_CHANNEL_CAPACITY);
        Ok(Self {
            daemon: None,
            tx,
            active_browses: Arc::new(Mutex::new(HashMap::new())),
            seen_instances: Arc::new(Mutex::new(HashMap::new())),
            filter_non_link_local,
        })
    }

    pub fn subscribe(&self) -> broadcast::Receiver<MdnsEvent> {
        self.tx.subscribe()
    }

    pub fn reset(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        log::debug!("[mdns] resetting...");
        if let Some(daemon) = self.daemon.take() {
            let mut attempts = 0;
            let max_attempts = 5;
            loop {
                match daemon.shutdown() {
                    Err(mdns_sd::Error::Again) if attempts < max_attempts => {
                        attempts += 1;
                        log::debug!("[mdns] shutdown busy, retrying ({attempts}/{max_attempts})...");
                        std::thread::sleep(std::time::Duration::from_millis(100));
                    }
                    Ok(status_rx) => {
                        log::debug!("[mdns] waiting for shutdown completion...");
                        let _ = status_rx.recv();
                        break;
                    }
                    Err(mdns_sd::Error::Again) => {
                        log::debug!(
                            "[mdns] shutdown still busy after {max_attempts} attempts, proceeding"
                        );
                        break;
                    }
                    Err(e) => {
                        log::debug!("[mdns] shutdown error (proceeding): {e}");
                        break;
                    }
                }
            }
        }
        let daemon = ServiceDaemon::new()?;
        Self::configure_daemon(&daemon)?;
        self.daemon = Some(daemon);
        let (tx, _) = broadcast::channel(EVENT_CHANNEL_CAPACITY);
        self.tx = tx;
        self.active_browses.lock().unwrap().clear();
        self.seen_instances.lock().unwrap().clear();
        Ok(())
    }

    pub fn start(&self) -> Result<(), Box<dyn std::error::Error>> {
        log::debug!("[mdns] starting discovery...");
        let daemon = self.daemon.as_ref().ok_or("daemon not initialized")?;
        let enum_rx = daemon.browse("_services._dns-sd._udp.local.")?;
        log::debug!("[mdns] enumeration receiver obtained");
        let tx = self.tx.clone();
        let daemon = self.daemon.as_ref().unwrap().clone();
        let active_browses = self.active_browses.clone();
        let seen_instances = self.seen_instances.clone();
        let filter_non_link_local = self.filter_non_link_local;

        std::thread::spawn(move || {
            while let Ok(event) = enum_rx.recv() {
                let (fullname, is_resolved) = match &event {
                    ServiceEvent::ServiceResolved(r) => (r.get_fullname().to_string(), true),
                    ServiceEvent::ServiceFound(_, f) => (f.to_string(), false),
                    ServiceEvent::SearchStarted(st) => {
                        log::debug!("[mdns] search started: {st}");
                        continue;
                    }
                    _ => continue,
                };

                let result = if is_resolved {
                    extract_service_type(&fullname)
                } else {
                    extract_service_type_from_found(&fullname)
                };

                if let Some(service_type) = result {
                    if service_type.contains("._sub.") {
                        log::debug!("[mdns] skipping subtype: {service_type}");
                        continue;
                    }
                    log::debug!("[mdns] discovered type: {service_type}");

                    let _ = tx.send(MdnsEvent::TypeAdded {
                        service_type: service_type.clone(),
                    });

                    let already_browsing = {
                        let mut active = active_browses.lock().unwrap();
                        active.insert(service_type.clone(), true).is_some()
                    };

                    if already_browsing {
                        continue;
                    }

                    match daemon.browse(&service_type) {
                        Ok(type_rx) => {
                            let tx2 = tx.clone();
                            let seen = seen_instances.clone();
                            let filter = filter_non_link_local;
                            std::thread::spawn(move || {
                                while let Ok(ev) = type_rx.recv() {
                                    match ev {
                                        ServiceEvent::ServiceResolved(svc) => {
                                            let discovered = resolved_to_discovered(&svc, filter);
                                            let id = discovered.id.clone();
                                            let mut cache = seen.lock().unwrap();
                                            if let Some(prev) = cache.get(&id)
                                                && *prev == discovered
                                            {
                                                log::debug!(
                                                    "[mdns] unchanged: {}",
                                                    discovered.name
                                                );
                                                continue;
                                            }
                                            log::debug!("[mdns] resolved: {}", discovered.name);
                                            cache.insert(id, discovered.clone());
                                            drop(cache);
                                            let _ = tx2.send(MdnsEvent::Added(discovered));
                                        }
                                        ServiceEvent::ServiceRemoved(st, fullname) => {
                                            log::debug!("[mdns] removed: {fullname}");
                                            let id = extract_instance_id(&fullname);
                                            if let Some(ref instid) = id {
                                                seen.lock().unwrap().remove(instid);
                                            }
                                            let _ = tx2.send(MdnsEvent::Removed {
                                                id: id.unwrap_or(fullname),
                                                service_type: st,
                                            });
                                        }
                                        _ => {}
                                    }
                                }
                            });
                        }
                        Err(e) => {
                            log::error!("[mdns] browse error for {}: {}", service_type, e);
                        }
                    }
                }
            }
        });

        Ok(())
    }
}

fn extract_service_type(fullname: &str) -> Option<String> {
    // Resolved fullname: "_http._tcp._services._dns-sd._udp.local."
    let suffix = "._services._dns-sd._udp.local.";
    if let Some(rest) = fullname.strip_suffix(suffix) {
        let st = rest.trim_start_matches('.');
        if !st.is_empty() {
            return Some(format!("{st}.local."));
        }
    }
    None
}

fn extract_service_type_from_found(found: &str) -> Option<String> {
    // ServiceFound gives (service_type, fullname). The fullname
    // for enumeration PTR records may be:
    //   "_http._tcp._services._dns-sd._udp.local." (suffixed)
    // or just "_http._tcp.local." (the PTR target directly).
    // Try suffix strip first:
    if let Some(st) = extract_service_type(found) {
        return Some(st);
    }
    // Otherwise, check if it looks like a service type directly:
    // "_http._tcp.local."  or  "_http._tcp"
    let clean = found.trim_end_matches('.');
    if clean.starts_with('_') {
        let has_tcp = clean.contains("._tcp");
        let has_udp = clean.contains("._udp");
        if has_tcp || has_udp {
            // ensure it ends with .local.
            if clean.ends_with(".local") {
                return Some(format!("{}.", clean));
            }
            return Some(format!("{clean}.local."));
        }
    }
    None
}

fn clean_hostname(hostname: &str) -> String {
    hostname
        .replace(".local.", ".")
        .trim_end_matches('.')
        .to_string()
}

fn derive_urls(
    info: &ResolvedService,
    txt: &HashMap<String, String>,
    addresses: &[AddressInfo],
) -> Vec<String> {
    let mut urls = Vec::new();
    let port = info.get_port();
    let ty = info.ty_domain.to_lowercase();
    let path = txt.get("path").map(|p| {
        let p = p.trim();
        if p.starts_with('/') {
            p.to_string()
        } else {
            format!("/{p}")
        }
    });
    let path = path.as_deref().unwrap_or("/");

    if ty.starts_with("_http._tcp") || ty.starts_with("_https._tcp") {
        let scheme = if ty.starts_with("_https._tcp") {
            "https"
        } else {
            "http"
        };
        let host = clean_hostname(info.get_hostname());
        urls.push(format!("{scheme}://{host}:{port}{path}"));
        for a in addresses {
            let ip = &a.ip;
            if ip.starts_with("fe80:") || ip.starts_with("FE80:") {
                continue;
            }
            let addr_str = if ip.contains(':') {
                format!("[{ip}]")
            } else {
                ip.to_string()
            };
            let u = format!("{scheme}://{addr_str}:{port}{path}");
            if !urls.contains(&u) {
                urls.push(u);
            }
        }
    }

    for v in txt.values() {
        if let Ok(parsed) = Url::parse(v.trim())
            && (parsed.scheme() == "http" || parsed.scheme() == "https")
        {
            let s = parsed.to_string();
            if !urls.contains(&s) {
                urls.push(s);
            }
        }
    }

    urls.sort();
    urls
}

fn resolved_to_discovered(
    info: &ResolvedService,
    filter_non_link_local: bool,
) -> ServiceDiscovered {
    let fullname = info.get_fullname();
    let suffix = info.ty_domain.trim_end_matches('.');
    let name = fullname
        .trim_end_matches('.')
        .strip_suffix(suffix)
        .and_then(|s| s.strip_suffix('.'))
        .unwrap_or("")
        .to_string();
    let txt: HashMap<String, String> = info
        .txt_properties
        .iter()
        .map(|p| (p.key().to_string(), p.val_str().to_string()))
        .collect();
    let addresses: Vec<AddressInfo> = info
        .get_addresses()
        .iter()
        .filter(|s| !filter_non_link_local || keep_address(s))
        .map(|s| {
            let interfaces: Vec<String> = match s {
                ScopedIp::V4(v4) => v4
                    .interface_ids()
                    .iter()
                    .map(|id| id.name.clone())
                    .collect(),
                ScopedIp::V6(v6) => vec![v6.scope_id().name.clone()],
                _ => vec![],
            };
            AddressInfo {
                ip: s.to_ip_addr().to_string(),
                interfaces,
            }
        })
        .collect();
    let urls = derive_urls(info, &txt, &addresses);
    ServiceDiscovered {
        id: fullname.to_string(),
        name,
        service_type: info.ty_domain.to_string(),
        sub_type: info.get_subtype().clone(),
        hostname: info.get_hostname().to_string(),
        port: info.get_port(),
        addresses,
        txt,
        urls,
    }
}

fn keep_address(ip: &ScopedIp) -> bool {
    match ip.to_ip_addr() {
        std::net::IpAddr::V4(_) => true,
        std::net::IpAddr::V6(v6) => v6.is_unicast_link_local(),
    }
}

fn extract_instance_id(fullname: &str) -> Option<String> {
    fullname.split('.').next().map(|s| s.to_string())
}
