<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Network } from 'vis-network';
  import { DataSet } from 'vis-data';
  import { get } from 'svelte/store';
  import { graphNodes, graphEdges, selectedNodeId, physicsConfig, filterQuery } from './store';
  import type { GraphNode, GraphEdge } from './types';

  let container: HTMLDivElement;
  let network: Network;
  let visNodes = new DataSet<any>([]);
  let visEdges = new DataSet<any>([]);
  let prevNodeIds = new Set<string>();
  let prevEdgeIds = new Set<string>();

  function buildPhysicsOpts(cfg: import('./types').PhysicsConfig) {
    const isRepulsion = cfg.solver === 'repulsion' || cfg.solver === 'hierarchicalRepulsion';
    return {
      solver: cfg.solver,
      stabilization: { iterations: 200 },
      [cfg.solver]: {
        ...(isRepulsion ? { nodeDistance: -cfg.gravitationalConstant } : { gravitationalConstant: cfg.gravitationalConstant }),
        centralGravity: cfg.centralGravity,
        springLength: cfg.springLength,
        springConstant: cfg.springConstant,
        damping: cfg.damping,
      },
    };
  }

  const options: any = {
    nodes: {
      font: { size: 12, color: '#e0e0e0' },
      borderWidth: 2,
      shadow: { enabled: true, size: 4 },
    },
    edges: {
      width: 2,
      font: { size: 10, color: '#b0bec5', align: 'middle' },
      smooth: { enabled: true, type: 'continuous', roundness: 0.5 },
    },
    groups: {
      'service-type': {
        shape: 'diamond',
        color: { background: '#4fc3f7', border: '#0288d1' },
        font: { color: '#e1f5fe', size: 13 },
      },
      instance: {
        shape: 'dot',
        color: { background: '#81c784', border: '#388e3c' },
        font: { color: '#e8f5e9' },
      },
      host: {
        shape: 'square',
        color: { background: '#ffb74d', border: '#f57c00' },
        font: { color: '#fff3e0' },
      },
      address: {
        shape: 'triangle',
        color: { background: '#ce93d8', border: '#7b1fa2' },
        font: { color: '#f3e5f5', size: 11 },
      },
    },
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      hover: true,
      tooltipDelay: 200,
    },
    layout: { improvedLayout: true },
  };

  function syncGraph() {
    const nodes = get(graphNodes);
    const edges = get(graphEdges);

    const curNodeIds = new Set(nodes.keys());
    for (const id of prevNodeIds) { if (!curNodeIds.has(id)) visNodes.remove(id); }
    const addN: GraphNode[] = [];
    for (const [id, n] of nodes) { if (!prevNodeIds.has(id)) addN.push(n); }
    if (addN.length > 0) visNodes.add(addN);
    prevNodeIds = curNodeIds;

    const curEdgeIds = new Set(edges.keys());
    for (const id of prevEdgeIds) { if (!curEdgeIds.has(id)) visEdges.remove(id); }
    const addE: GraphEdge[] = [];
    for (const [id, e] of edges) { if (!prevEdgeIds.has(id)) addE.push(e); }
    if (addE.length > 0) visEdges.add(addE);
    prevEdgeIds = curEdgeIds;
  }

  function applyPhysics(cfg: import('./types').PhysicsConfig) {
    if (!network) return;
    network.setOptions({ physics: buildPhysicsOpts(cfg) });
  }

  function nodeMatchesQuery(n: GraphNode, q: string): boolean {
    const lower = q.toLowerCase();
    if (n.label.toLowerCase().includes(lower)) return true;
    if (n.hostname?.toLowerCase().includes(lower)) return true;
    if (n.serviceType?.toLowerCase().includes(lower)) return true;
    if (n.subType?.toLowerCase().includes(lower)) return true;
    if (n.port?.toString().includes(lower)) return true;
    if (n.addresses) for (const a of n.addresses) { if (a.ip.includes(lower)) return true; }
    if (n.interfaces) for (const i of n.interfaces) { if (i.toLowerCase().includes(lower)) return true; }
    if (n.urls) for (const u of n.urls) { if (u.toLowerCase().includes(lower)) return true; }
    if (n.txt) for (const [k, v] of Object.entries(n.txt)) { if (k.toLowerCase().includes(lower) || v.toLowerCase().includes(lower)) return true; }
    return false;
  }

  function applyFilter(q: string) {
    const allNodes = get(graphNodes);
    if (q.length === 0) {
      const updates: any[] = [];
      for (const n of allNodes.values()) updates.push({ id: n.id, hidden: false });
      if (updates.length > 0) visNodes.updateOnly(updates);
      return;
    }

    const matchingIds = new Set<string>();
    for (const n of allNodes.values()) {
      if (nodeMatchesQuery(n, q)) matchingIds.add(n.id);
    }

    const allEdges = get(graphEdges);
    const neighborIds = new Set<string>(matchingIds);
    for (const e of allEdges.values()) {
      if (matchingIds.has(e.from) && !matchingIds.has(e.to)) neighborIds.add(e.to);
      if (matchingIds.has(e.to) && !matchingIds.has(e.from)) neighborIds.add(e.from);
    }

    const updates: any[] = [];
    for (const n of allNodes.values()) {
      updates.push({ id: n.id, hidden: !neighborIds.has(n.id) });
    }
    if (updates.length > 0) visNodes.updateOnly(updates);
  }

  onMount(() => {
    const initialCfg = get(physicsConfig);
    options.physics = buildPhysicsOpts(initialCfg);
    network = new Network(container, { nodes: visNodes, edges: visEdges }, options);

    const ro = new ResizeObserver(() => {
      network.setSize(`${container.offsetWidth}px`, `${container.offsetHeight}px`);
    });
    ro.observe(container);

    network.on('click', (params: any) => {
      if (params.nodes.length > 0) {
        selectedNodeId.set(params.nodes[0]);
      } else {
        selectedNodeId.set(null);
      }
    });

    network.on('deselectNode', () => {
      selectedNodeId.set(null);
    });

    const unsub1 = graphNodes.subscribe(syncGraph);
    const unsub2 = graphEdges.subscribe(syncGraph);
    const unsub3 = physicsConfig.subscribe(applyPhysics);
    const unsub4 = filterQuery.subscribe(applyFilter);

    onDestroy(() => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      ro.disconnect();
      network?.destroy();
    });
  });
</script>

<div bind:this={container} class="graph-container"></div>

<style>
  .graph-container {
    position: absolute;
    inset: 0;
    background: #1a1a2e;
  }
  :global(.vis-network) {
    outline: none;
  }
</style>
