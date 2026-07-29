use mdns_sd::{ResolvedService, ScopedIp, ServiceDaemon, ServiceEvent};
use serde::Serialize;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;

#[derive(Clone, Serialize, Debug, PartialEq)]
pub struct ServiceDiscovered {
    pub id: String,
    pub name: String,
    pub service_type: String,
    pub hostname: String,
    pub port: u16,
    pub addresses: Vec<String>,
    pub txt: HashMap<String, String>,
}

#[derive(Clone, Serialize, Debug)]
#[serde(tag = "type", content = "data")]
pub enum MdnsEvent {
    #[serde(rename = "service-added")]
    ServiceAdded(ServiceDiscovered),
    #[serde(rename = "service-removed")]
    ServiceRemoved { id: String, service_type: String },
    #[serde(rename = "service-type-added")]
    ServiceTypeAdded { service_type: String },
}

pub struct MdnsBrowser {
    daemon: ServiceDaemon,
    tx: broadcast::Sender<MdnsEvent>,
    active_browses: Arc<Mutex<HashMap<String, bool>>>,
    seen_instances: Arc<Mutex<HashMap<String, ServiceDiscovered>>>,
    started: std::sync::atomic::AtomicBool,
}

impl MdnsBrowser {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let daemon = ServiceDaemon::new()?;
        let (tx, _) = broadcast::channel(512);
        Ok(Self {
            daemon,
            tx,
            active_browses: Arc::new(Mutex::new(HashMap::new())),
            seen_instances: Arc::new(Mutex::new(HashMap::new())),
            started: std::sync::atomic::AtomicBool::new(false),
        })
    }

    pub fn subscribe(&self) -> broadcast::Receiver<MdnsEvent> {
        self.tx.subscribe()
    }

    pub fn start(&self) -> Result<(), Box<dyn std::error::Error>> {
        if self.started.swap(true, std::sync::atomic::Ordering::SeqCst) {
            eprintln!("[mdns] already started, ignoring duplicate call");
            return Ok(());
        }
        eprintln!("[mdns] starting discovery...");
        let enum_rx = self.daemon.browse("_services._dns-sd._udp.local.")?;
        eprintln!("[mdns] enumeration receiver obtained");
        let tx = self.tx.clone();
        let daemon = self.daemon.clone();
        let active_browses = self.active_browses.clone();
        let seen_instances = self.seen_instances.clone();

        std::thread::spawn(move || {
            while let Ok(event) = enum_rx.recv() {
                let (fullname, is_resolved) = match &event {
                    ServiceEvent::ServiceResolved(r) => (r.get_fullname().to_string(), true),
                    ServiceEvent::ServiceFound(_, f) => (f.to_string(), false),
                    ServiceEvent::SearchStarted(st) => {
                        eprintln!("[mdns] search started: {st}");
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
                        eprintln!("[mdns] skipping subtype: {service_type}");
                        continue;
                    }
                    eprintln!("[mdns] discovered type: {service_type}");

                    let _ = tx.send(MdnsEvent::ServiceTypeAdded {
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
                            std::thread::spawn(move || {
                                while let Ok(ev) = type_rx.recv() {
                                    match ev {
                                        ServiceEvent::ServiceResolved(svc) => {
                                            let discovered = resolved_to_discovered(&svc);
                                            let id = discovered.id.clone();
                                            let mut cache = seen.lock().unwrap();
                                            if let Some(prev) = cache.get(&id) {
                                                if *prev == discovered {
                                                    eprintln!("[mdns] unchanged: {}", discovered.name);
                                                    continue;
                                                }
                                            }
                                            eprintln!("[mdns] resolved: {}", discovered.name);
                                            cache.insert(id, discovered.clone());
                                            drop(cache);
                                            let _ = tx2
                                                .send(MdnsEvent::ServiceAdded(discovered));
                                        }
                                        ServiceEvent::ServiceRemoved(st, fullname) => {
                                            eprintln!("[mdns] removed: {fullname}");
                                            let id = extract_instance_id(&fullname);
                                            if let Some(ref instid) = id {
                                                seen.lock().unwrap().remove(instid);
                                            }
                                            let _ = tx2.send(MdnsEvent::ServiceRemoved {
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
                            eprintln!("[mdns] browse error for {}: {}", service_type, e);
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

fn resolved_to_discovered(info: &ResolvedService) -> ServiceDiscovered {
    let fullname = info.get_fullname().to_string();
    let name = fullname
        .splitn(2, '.')
        .next()
        .unwrap_or("")
        .to_string();
    ServiceDiscovered {
        id: fullname,
        name,
        service_type: info.ty_domain.to_string(),
        hostname: info.get_hostname().to_string(),
        port: info.get_port(),
        addresses: info
            .get_addresses()
            .iter()
            .map(|s| scoped_ip_to_string(s))
            .collect(),
        txt: info
            .txt_properties
            .iter()
            .map(|p| (p.key().to_string(), p.val_str().to_string()))
            .collect(),
    }
}

fn scoped_ip_to_string(ip: &ScopedIp) -> String {
    ip.to_ip_addr().to_string()
}

fn extract_instance_id(fullname: &str) -> Option<String> {
    fullname.splitn(2, '.').next().map(|s| s.to_string())
}
