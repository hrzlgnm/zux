<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Network } from 'vis-network';
  import { DataSet } from 'vis-data';
  import { graphNodes, graphEdges, selectedNodeId } from './store';
  import type { GraphNode, GraphEdge } from './types';

  let container: HTMLDivElement;
  let network: Network;
  let visNodes = new DataSet<any>([]);
  let visEdges = new DataSet<any>([]);
  let unsubNodes: () => void;
  let unsubEdges: () => void;

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
    physics: {
      solver: 'forceAtlas2Based',
      stabilization: { iterations: 200 },
      forceAtlas2Based: {
        gravitationalConstant: -40,
        centralGravity: 0.005,
        springLength: 180,
        springConstant: 0.02,
        damping: 0.4,
      },
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

  function syncNodes(nodes: Map<string, GraphNode>) {
    visNodes.clear();
    visNodes.add(Array.from(nodes.values()));
  }

  function syncEdges(edges: Map<string, GraphEdge>) {
    visEdges.clear();
    visEdges.add(Array.from(edges.values()));
  }

  onMount(() => {
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

    unsubNodes = graphNodes.subscribe(syncNodes);
    unsubEdges = graphEdges.subscribe(syncEdges);
  });

  onDestroy(() => {
    unsubNodes?.();
    unsubEdges?.();
    network?.destroy();
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
