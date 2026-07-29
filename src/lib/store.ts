import { writable, derived, get } from 'svelte/store';
import { listen } from '@tauri-apps/api/event';
import type { GraphNode, GraphEdge, PhysicsConfig } from './types';

export const graphNodes = writable<Map<string, GraphNode>>(new Map());
export const graphEdges = writable<Map<string, GraphEdge>>(new Map());
export const selectedNodeId = writable<string | null>(null);
export const serviceTypes = writable<Set<string>>(new Set());
export const filterQuery = writable<string>('');

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

export function setupEventListeners() {
  console.log('[zux] setting up event listeners');
  listen<any>('mdns-event', (event) => {
    const p = event.payload;
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
          } else if (existing.offline) {
            m.set(nId, applyOnlineStyle({
              ...existing,
              label: d.name || d.id.split('.')[0],
              hostname: d.hostname, port: d.port,
              addresses: d.addresses, txt: d.txt, urls: d.urls,
              subType: d.sub_type,
            }));
          }
          if (!m.has(hId)) {
            m.set(hId, {
              id: hId, label: d.hostname.replace('.local.', ''),
              group: 'host', shape: 'square', size: 20, color: '#ffb74d',
              hostname: d.hostname, addresses: d.addresses,
            });
          }
          if (d.addresses) {
            for (const a of d.addresses) {
              const aId = addrId(a.ip);
              if (!m.has(aId)) {
                m.set(aId, {
                  id: aId, label: a.ip,
                  group: 'address', shape: 'triangle', size: 12, color: '#ce93d8',
                  interfaces: a.interfaces,
                });
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
  });
}
