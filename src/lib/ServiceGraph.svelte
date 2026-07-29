<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Network } from 'vis-network';
  import { DataSet } from 'vis-data';
  import { get } from 'svelte/store';
  import { graphNodes, graphEdges, selectedNodeId, serviceTypeFilter, physicsConfig } from './store';
  import type { GraphNode, GraphEdge } from './types';

  let container: HTMLDivElement;
  let network: Network;
  let visNodes = new DataSet<any>([]);
  let visEdges = new DataSet<any>([]);

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

  function syncFiltered() {
    const nodes = get(graphNodes);
    const edges = get(graphEdges);
    const filter = get(serviceTypeFilter);

    if (filter === null) {
      visNodes.clear();
      visNodes.add(Array.from(nodes.values()));
      visEdges.clear();
      visEdges.add(Array.from(edges.values()));
      return;
    }

    const visibleIds = new Set<string>();
    const visibleNodes: GraphNode[] = [];
    const visibleEdges: GraphEdge[] = [];

    for (const n of nodes.values()) {
      if (n.group === 'service-type') {
        if (filter.has(n.id.replace('type:', ''))) {
          visibleIds.add(n.id);
          visibleNodes.push(n);
        }
      } else if (n.group === 'instance') {
        if (n.serviceType && filter.has(n.serviceType)) {
          visibleIds.add(n.id);
          visibleNodes.push(n);
        }
      } else {
        visibleIds.add(n.id);
        visibleNodes.push(n);
      }
    }

    for (const e of edges.values()) {
      if (visibleIds.has(e.from) && visibleIds.has(e.to)) {
        visibleEdges.push(e);
      }
    }

    visNodes.clear();
    visNodes.add(visibleNodes);
    visEdges.clear();
    visEdges.add(visibleEdges);
  }

  function applyPhysics(cfg: import('./types').PhysicsConfig) {
    if (!network) return;
    network.setOptions({ physics: buildPhysicsOpts(cfg) });
  }

  onMount(() => {
    const initialCfg = get(physicsConfig);
    options.physics = buildPhysicsOpts(initialCfg);
    network = new Network(container, { nodes: visNodes, edges: visEdges }, options);

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

    const unsub1 = graphNodes.subscribe(syncFiltered);
    const unsub2 = graphEdges.subscribe(syncFiltered);
    const unsub3 = serviceTypeFilter.subscribe(syncFiltered);
    const unsub4 = physicsConfig.subscribe(applyPhysics);

    onDestroy(() => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      network?.destroy();
    });
  });
</script>

<div bind:this={container} class="graph-container"></div>

<style>
  .graph-container {
    width: 100%;
    height: 100%;
    background: #1a1a2e;
  }
  :global(.vis-network) {
    outline: none;
  }
</style>
