import { writable, derived } from 'svelte/store';
import { listen } from '@tauri-apps/api/event';
import type { GraphNode, GraphEdge, PhysicsConfig } from './types';

export const graphNodes = writable<Map<string, GraphNode>>(new Map());
export const graphEdges = writable<Map<string, GraphEdge>>(new Map());
export const selectedNodeId = writable<string | null>(null);
export const isScanning = writable<boolean>(false);
export const serviceTypes = writable<Set<string>>(new Set());

export const physicsConfig = writable<PhysicsConfig>({
  solver: 'repulsion',
  gravitationalConstant: -100,
  centralGravity: 0.005,
  springLength: 75,
  springConstant: 0.05,
  damping: 0.4,
});

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
          if (!m.has(nId)) {
            m.set(nId, {
              id: nId, label: d.name || d.id.split('.')[0],
              group: 'instance', shape: 'dot', size: 15, color: '#81c784',
              serviceType: d.service_type, hostname: d.hostname,
              port: d.port, addresses: d.addresses, txt: d.txt,
            });
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
              const aId = addrId(a);
              if (!m.has(aId)) {
                m.set(aId, {
                  id: aId, label: a,
                  group: 'address', shape: 'triangle', size: 12, color: '#ce93d8',
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
              const aId = addrId(a);
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
        break;
      }
      case 'service-removed': {
        const r = p.data;
        const nId = instId(r.id, r.service_type);

        graphEdges.update(m => {
          const toRemove: string[] = [];
          for (const [eid, e] of m) {
            if (e.from === nId || e.to === nId) toRemove.push(eid);
          }
          for (const eid of toRemove) m.delete(eid);
          return m;
        });

        graphNodes.update(m => { m.delete(nId); return m; });
        break;
      }
    }
  });
}
