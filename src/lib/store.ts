import { writable, derived, get } from 'svelte/store';
import { listen } from '@tauri-apps/api/event';
import type { Network } from 'vis-network';
import type { GraphNode, GraphEdge, PhysicsConfig, AddressInfo } from './types';

export const graphNodes = writable<Map<string, GraphNode>>(new Map());
export const graphEdges = writable<Map<string, GraphEdge>>(new Map());
export const graphNetwork = writable<Network | null>(null);
export const selectedNodeId = writable<string | null>(null);
export const serviceTypes = writable<Set<string>>(new Set());
export const filterQuery = writable<string>('');
export const disabledGroups = writable<Set<string>>(new Set(['service-type']));

export const physicsConfig = writable<PhysicsConfig>({
  solver: 'repulsion',
  gravitationalConstant: -100,
  centralGravity: 0.005,
  springLength: 75,
  springConstant: 0.05,
  damping: 0.4,
});

export function clearGraph() {
  graphNodes.set(new Map());
  graphEdges.set(new Map());
  selectedNodeId.set(null);
  serviceTypes.set(new Set());
}

export const stats = derived([graphNodes, graphEdges], ([$nodes, $edges]) => {
  let types = 0, instances = 0, hosts = 0, addresses = 0;
  for (const n of $nodes.values()) {
    if (n.group === 'service-type') types++;
    else if (n.group === 'instance') instances++;
    else if (n.group === 'host') hosts++;
    else if (n.group === 'address') addresses++;
  }
  return { types, instances, hosts, addresses, edges: $edges.size };
});

function typeId(st: string) { return `type:${st}`; }
function instId(name: string, st: string) { return `inst:${name}:${st}`; }
function hostId(h: string) { return `host:${h}`; }
function addrId(a: string) { return `addr:${a}`; }

const OFFLINE_COLOR = { background: '#616161', border: '#424242' };
const OFFLINE_FONT = { color: '#9e9e9e' };

const ONLINE_COLORS: Record<string, string> = {
  instance: '#81c784',
  host: '#ffb74d',
  address: '#ce93d8',
};

function applyOfflineStyle(n: GraphNode): GraphNode {
  return { ...n, offline: true, color: OFFLINE_COLOR, font: OFFLINE_FONT };
}

function applyOnlineStyle(n: GraphNode): GraphNode {
  return { ...n, offline: false, color: ONLINE_COLORS[n.group] || '#e0e0e0', font: undefined as any };
}

function cascadeOffline() {
  const edges = get(graphEdges);
  graphNodes.update(nodes => {
    const hostInsts = new Map<string, string[]>();
    const hostAddrs = new Map<string, string[]>();
    for (const [eid, e] of edges) {
      if (eid.startsWith('e:ih:')) {
        const list = hostInsts.get(e.to) || [];
        list.push(e.from);
        hostInsts.set(e.to, list);
      } else if (eid.startsWith('e:ha:')) {
        const list = hostAddrs.get(e.from) || [];
        list.push(e.to);
        hostAddrs.set(e.from, list);
      }
    }
    for (const [hostId, instIds] of hostInsts) {
      const host = nodes.get(hostId);
      if (!host) continue;
      const allOffline = instIds.length > 0 && instIds.every(iid => {
        const inst = nodes.get(iid);
        return inst && inst.offline;
      });
      if (allOffline && !host.offline) {
        nodes.set(hostId, applyOfflineStyle(host));
      } else if (!allOffline && host.offline) {
        nodes.set(hostId, applyOnlineStyle(host));
      }
    }
    for (const [hostId, addrIds] of hostAddrs) {
      const host = nodes.get(hostId);
      const hostOffline = host && host.offline;
      for (const addrId of addrIds) {
        const addr = nodes.get(addrId);
        if (!addr) continue;
        if (hostOffline && !addr.offline) {
          nodes.set(addrId, applyOfflineStyle(addr));
        } else if (!hostOffline && addr.offline) {
          nodes.set(addrId, applyOnlineStyle(addr));
        }
      }
    }
    return nodes;
  });
}

function handleMdnsEvent(p: any) {
  console.log('[zux] event:', JSON.stringify(p).slice(0, 200));
  switch (p.type) {
      case 'service-type-added': {
        const st = p.data.service_type;
        serviceTypes.update(s => { s.add(st); return s; });
        const id = typeId(st);
        graphNodes.update(m => {
          if (!m.has(id)) {
            m.set(id, {
              id, label: st.replace('.local.', '').replace(/\.$/, ''),
              group: 'service-type', shape: 'diamond', size: 25, color: '#4fc3f7',
            });
          }
          return m;
        });
        break;
      }
      case 'service-added': {
        const d = p.data;
        const nId = instId(d.name || d.id, d.service_type);
        const hId = hostId(d.hostname || 'unknown');
        const tId = typeId(d.service_type);

        graphNodes.update(m => {
          const existing = m.get(nId);
          if (!existing) {
            m.set(nId, {
              id: nId, label: d.name || d.id.split('.')[0],
              group: 'instance', shape: 'dot', size: 15, color: '#81c784',
              serviceType: d.service_type, subType: d.sub_type, hostname: d.hostname,
              port: d.port, addresses: d.addresses, txt: d.txt, urls: d.urls,
            });
          } else {
            const updated = {
              ...existing,
              label: d.name || d.id.split('.')[0],
              hostname: d.hostname, port: d.port,
              addresses: d.addresses, txt: d.txt, urls: d.urls,
              subType: d.sub_type,
            };
            m.set(nId, existing.offline ? applyOnlineStyle(updated) : updated);
          }
          if (!m.has(hId)) {
            m.set(hId, {
              id: hId, label: d.hostname.replace('.local.', ''),
              group: 'host', shape: 'square', size: 20, color: '#ffb74d',
              hostname: d.hostname, addresses: d.addresses,
            });
          } else {
            const host = m.get(hId)!;
            m.set(hId, { ...host, addresses: d.addresses });
          }
          if (d.addresses) {
            const ipInterfaces = new Map<string, string[]>();
            for (const a of d.addresses) {
              const existing = ipInterfaces.get(a.ip);
              if (existing) {
                ipInterfaces.set(a.ip, [...existing, ...a.interfaces]);
              } else {
                ipInterfaces.set(a.ip, [...a.interfaces]);
              }
            }
            for (const [ip, interfaces] of ipInterfaces) {
              const aId = addrId(ip);
              const sorted = [...interfaces].sort();
              if (!m.has(aId)) {
                m.set(aId, {
                  id: aId, label: ip,
                  group: 'address', shape: 'triangle', size: 12, color: '#ce93d8',
                  interfaces: sorted,
                });
              } else {
                const addr = m.get(aId)!;
                m.set(aId, { ...addr, interfaces: sorted });
              }
            }
          }
          return m;
        });

        graphEdges.update(m => {
          m.set(`e:ti:${d.service_type}:${nId}`, {
            id: `e:ti:${d.service_type}:${nId}`,
            from: tId, to: nId, dashes: true, color: '#90a4ae',
          });
          m.set(`e:ih:${nId}:${hId}`, {
            id: `e:ih:${nId}:${hId}`,
            from: nId, to: hId, color: '#78909c',
          });
          if (d.addresses) {
            for (const a of d.addresses) {
              const aId = addrId(a.ip);
              const edgeId = `e:ha:${hId}:${aId}`;
              if (!m.has(edgeId)) {
                m.set(edgeId, {
                  id: edgeId,
                  from: hId, to: aId, color: '#b39ddb',
                });
                }
              }
            }
            return m;
          });

        if (d.addresses) {
          const currentAddrIds = new Set(d.addresses.map((a: AddressInfo) => addrId(a.ip)));
          graphEdges.update(edges => {
            for (const [eid, e] of edges) {
              if (eid.startsWith(`e:ha:${hId}:`) && !currentAddrIds.has(e.to)) {
                edges.delete(eid);
              }
            }
            return edges;
          });
          graphNodes.update(nodes => {
            const connectedAddrs = new Set<string>();
            for (const [, e] of get(graphEdges)) {
              if (e.from.startsWith('host:') && e.to.startsWith('addr:')) {
                connectedAddrs.add(e.to);
              }
            }
            for (const [nid, n] of nodes) {
              if (n.group === 'address' && !connectedAddrs.has(nid)) {
                nodes.delete(nid);
              }
            }
            return nodes;
          });
        }
        cascadeOffline();
        break;
      }
      case 'service-removed': {
        const r = p.data;
        const nId = instId(r.id, r.service_type);
        graphNodes.update(m => {
          const node = m.get(nId);
          if (node) {
            m.set(nId, applyOfflineStyle(node));
          }
          return m;
        });
        cascadeOffline();
        break;
      }
    }
}

export function setupEventListeners() {
  console.log('[zux] setting up event listeners');
  listen<any>('mdns-event', (event) => {
    const payload = event.payload;
    if (Array.isArray(payload)) {
      for (const p of payload) handleMdnsEvent(p);
    } else {
      handleMdnsEvent(payload);
    }
  });
}

const PREVIEW_SERVICE_TYPES = [
  '_http._tcp.local.',
  '_mqtt._tcp.local.',
  '_hap._tcp.local.',
  '_ssh._tcp.local.',
  '_airplay._tcp.local.',
  '_printer._tcp.local.',
]

interface PreviewService {
  id: string
  name: string
  service_type: string
  sub_type: string | null
  hostname: string
  port: number
  addresses: { ip: string; interfaces: string[] }[]
  txt: Record<string, string>
  urls: string[]
}

const PREVIEW_SERVICES: PreviewService[] = [
  {
    id: 'Frontend._http._tcp.local.',
    name: 'Frontend',
    service_type: '_http._tcp.local.',
    sub_type: null,
    hostname: 'pi-web.local.',
    port: 8080,
    addresses: [{ ip: '192.168.1.10', interfaces: ['eth0'] }],
    txt: { path: '/app', version: '2.3.1' },
    urls: ['http://pi-web.local:8080/app'],
  },
  {
    id: 'Home Assistant._http._tcp.local.',
    name: 'Home Assistant',
    service_type: '_http._tcp.local.',
    sub_type: null,
    hostname: 'pi-web.local.',
    port: 8123,
    addresses: [{ ip: '192.168.1.10', interfaces: ['eth0'] }],
    txt: { path: '/', api: 'ha' },
    urls: ['http://pi-web.local:8123/'],
  },
  {
    id: 'API Server._http._tcp.local.',
    name: 'API Server',
    service_type: '_http._tcp.local.',
    sub_type: null,
    hostname: 'dev-laptop.local.',
    port: 3000,
    addresses: [{ ip: '192.168.1.23', interfaces: ['wlp2s0'] }],
    txt: {},
    urls: ['http://dev-laptop.local:3000/'],
  },
  {
    id: 'MQTT Broker._mqtt._tcp.local.',
    name: 'MQTT Broker',
    service_type: '_mqtt._tcp.local.',
    sub_type: null,
    hostname: 'nas.local.',
    port: 1883,
    addresses: [{ ip: '192.168.1.5', interfaces: ['eth0'] }],
    txt: {},
    urls: [],
  },
  {
    id: 'Living Room TV._airplay._tcp.local.',
    name: 'Living Room TV',
    service_type: '_airplay._tcp.local.',
    sub_type: null,
    hostname: 'living-room-tv.local.',
    port: 7000,
    addresses: [{ ip: '192.168.1.42', interfaces: ['en0'] }],
    txt: { model: 'TV', deviceid: 'AA:BB:CC:DD:EE:FF' },
    urls: [],
  },
  {
    id: 'Front Door Cam._hap._tcp.local.',
    name: 'Front Door Cam',
    service_type: '_hap._tcp.local.',
    sub_type: null,
    hostname: 'doorbell.local.',
    port: 51827,
    addresses: [{ ip: '192.168.1.44', interfaces: ['wlan0'] }],
    txt: { sf: '0', id: '12:34:56:78:90:AB' },
    urls: [],
  },
  {
    id: 'Raspberry Pi SSH._ssh._tcp.local.',
    name: 'Raspberry Pi SSH',
    service_type: '_ssh._tcp.local.',
    sub_type: null,
    hostname: 'pi-web.local.',
    port: 22,
    addresses: [{ ip: '192.168.1.10', interfaces: ['eth0'] }],
    txt: {},
    urls: [],
  },
  {
    id: 'Laser Printer._printer._tcp.local.',
    name: 'Laser Printer',
    service_type: '_printer._tcp.local.',
    sub_type: null,
    hostname: 'printer.local.',
    port: 631,
    addresses: [{ ip: '192.168.1.60', interfaces: ['eth0'] }],
    txt: { product: 'LaserJet', rp: 'ipp/print' },
    urls: [],
  },
]

export function seedPreviewData() {
  console.log('[zux] seeding preview data');
  for (const st of PREVIEW_SERVICE_TYPES) {
    handleMdnsEvent({ type: 'service-type-added', data: { service_type: st } });
  }
  for (const s of PREVIEW_SERVICES) {
    handleMdnsEvent({ type: 'service-added', data: s });
  }
}
