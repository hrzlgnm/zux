<script lang="ts">
  import { onMount } from 'svelte';
  import { setupEventListeners, clearGraph } from '$lib/store';
  import { invoke } from '@tauri-apps/api/core';
  import { check } from '@tauri-apps/plugin-updater';
  import ServiceGraph from '$lib/ServiceGraph.svelte';
  import Sidebar from '$lib/Sidebar.svelte';
  import NodeDetail from '$lib/NodeDetail.svelte';

  onMount(() => {
    setupEventListeners();
    clearGraph();
    invoke('start_discovery').catch(() => {});
    check().catch(() => {});
  });
</script>

<div class="layout">
  <Sidebar />
  <main class="graph-area">
    <ServiceGraph />
    <NodeDetail />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #1a1a2e;
  }
  .layout {
    display: flex;
    width: 100vw;
    height: 100vh;
  }
  .graph-area {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
</style>
