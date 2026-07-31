<script lang="ts">
  import { onMount } from 'svelte';
  import { setupEventListeners, clearGraph } from '$lib/store';
  import { invoke } from '@tauri-apps/api/core';
  import { confirm } from '@tauri-apps/plugin-dialog';
  import { relaunch } from '@tauri-apps/plugin-process';
  import { check } from '@tauri-apps/plugin-updater';
  import ServiceGraph from '$lib/ServiceGraph.svelte';
  import Sidebar from '$lib/Sidebar.svelte';
  import NodeDetail from '$lib/NodeDetail.svelte';

  onMount(async () => {
    setupEventListeners();
    clearGraph();
    invoke('start_discovery').catch(() => {});
    const canUpdate = await invoke<boolean>('can_auto_update');
    if (canUpdate) {
      const update = await check().catch(() => null);
      if (!update) return;
      const confirmed = await confirm(
        `A new version of zux (${update.version}) is available. Update now?`,
        { title: 'Update available', kind: 'info' }
      ).catch(() => false);
      if (confirmed) {
        await update.downloadAndInstall();
        await relaunch();
      }
    }
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
