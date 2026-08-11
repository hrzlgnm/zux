<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { isTauri, invoke } from '@tauri-apps/api/core'
  import type { UnlistenFn } from '@tauri-apps/api/event'
  import { confirm } from '@tauri-apps/plugin-dialog'
  import { relaunch } from '@tauri-apps/plugin-process'
  import { check } from '@tauri-apps/plugin-updater'
  import { setupEventListeners, clearGraph, seedPreviewData } from '$lib/store'
  import ServiceGraph from '$lib/ServiceGraph.svelte'
  import Sidebar from '$lib/Sidebar.svelte'
  import NodeDetail from '$lib/NodeDetail.svelte'

  let unlisten: UnlistenFn | null = null
  let mounted = true

  onMount(async () => {
    if (isTauri()) {
      try {
        const fn = await setupEventListeners()
        if (mounted) {
          unlisten = fn
        } else {
          fn()
        }
      } catch (e) {
        console.log('[zux] failed to subscribe to mdns events:', e)
      }
      if (!mounted) return
      clearGraph()
      invoke('start_discovery').catch(() => {})
      checkForUpdates()
    } else {
      seedPreviewData()
    }
  })

  onDestroy(() => {
    mounted = false
    if (unlisten) {
      unlisten()
      unlisten = null
    }
  })

  async function checkForUpdates() {
    try {
      const canUpdate = await invoke<boolean>('can_auto_update')
      if (!canUpdate) return
      if (/Android/i.test(navigator.userAgent)) {
        const update = await invoke<UpdateMeta | null>('fetch_update')
        if (!update) return
        const confirmed = await confirm(
          `A new version of zux (${update.version}) is available. Open the release page to download it?`,
          { title: 'Update available', kind: 'info' },
        )
        if (confirmed) {
          await invoke('install_update')
        }
        return
      }
      const update = await check()
      if (!update) return
      try {
        const confirmed = await confirm(
          `A new version of zux (${update.version}) is available. Update now?`,
          { title: 'Update available', kind: 'info' },
        )
        if (confirmed) {
          await update.downloadAndInstall()
          await relaunch()
        }
      } finally {
        await update.close()
      }
    } catch (e) {
      console.log('[zux] update check failed:', e)
    }
  }

  interface UpdateMeta {
    version: string
    currentVersion: string
  }
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
    height: 100dvh;
  }
  .graph-area {
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
  }
  @media (max-width: 768px) {
    .layout {
      flex-direction: column;
    }
  }
</style>
