<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import '@fontsource-variable/inter'
  import { isTauri, invoke } from '@tauri-apps/api/core'
  import type { UnlistenFn } from '@tauri-apps/api/event'
  import { confirm } from '@tauri-apps/plugin-dialog'
  import { relaunch } from '@tauri-apps/plugin-process'
  import { check } from '@tauri-apps/plugin-updater'
  import {
    setupEventListeners,
    clearGraph,
    seedPreviewData,
    initPhysicsConfig,
    initTheme,
    selectedNodeId,
    graphNetwork,
  } from '$lib/store'
  import ServiceGraph from '$lib/ServiceGraph.svelte'
  import Sidebar from '$lib/Sidebar.svelte'
  import NodeDetail from '$lib/NodeDetail.svelte'
  import pkg from '../../package.json'

  let unlisten: UnlistenFn | null = null
  let mounted = true
  let drawerOpen = $state(false)
  let hamburgerEl: HTMLButtonElement | undefined = $state(undefined)

  function closeDrawer() {
    drawerOpen = false
    hamburgerEl?.focus()
  }

  function toggleDrawer() {
    drawerOpen = !drawerOpen
  }

  let prevSelectedNodeId: string | null = $state(null)

  $effect(() => {
    const id = $selectedNodeId
    if (id !== null && id !== prevSelectedNodeId && drawerOpen) {
      const isMobile = window.matchMedia('(max-width: 768px)').matches
      if (isMobile) drawerOpen = false
    }
    prevSelectedNodeId = id
  })

  $effect(() => {
    if (!drawerOpen) return
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        drawerOpen = false
        hamburgerEl?.focus()
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  })

  $effect(() => {
    // trigger vis-network resize after drawer transition / header layout
    // the graph container is inside .graph-area which changes size when the
    // mobile header is present; the drawer itself is overlay so no resize
    // is needed for the drawer, but ensure the network redraws
    void drawerOpen
    if (typeof window === 'undefined') return
    const raf = requestAnimationFrame(() => {
      const network = $graphNetwork
      // ResizeObserver in ServiceGraph already handles container resize,
      // but force a redraw after the CSS transition completes
      setTimeout(() => {
        if (network) {
          try {
            network.redraw()
          } catch (e) {
            console.warn('[zux] redraw failed:', e)
          }
        }
      }, 240)
    })
    return () => cancelAnimationFrame(raf)
  })

  onMount(async () => {
    if (isTauri()) {
      void initPhysicsConfig()
      void initTheme()
      try {
        const fn = await setupEventListeners()
        if (mounted) {
          unlisten = fn
        } else {
          fn()
        }
      } catch (e) {
        console.error('[zux] failed to subscribe to mdns events:', e)
      }
      if (!mounted) return
      clearGraph()
      invoke('start_discovery').catch(() => {})
      checkForUpdates()
    } else {
      void initTheme()
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
        const update = await invoke<UpdateMeta | null>('plugin:android-update|check')
        if (!update) return
        const confirmed = await confirm(
          `A new version of zux (${update.version}) is available. Open the release page to download it?`,
          { title: 'Update available', kind: 'info' },
        )
        if (confirmed) {
          await invoke('plugin:android-update|download_and_install')
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
      console.warn('[zux] update check failed:', e)
    }
  }

  interface UpdateMeta {
    version: string
    currentVersion: string
  }
</script>

<div class="layout">
  <Sidebar open={drawerOpen} onClose={closeDrawer} />
  <main class="graph-area">
    <header class="mobile-header">
      <button
        bind:this={hamburgerEl}
        class="hamburger"
        type="button"
        aria-label="Open filters and settings"
        aria-expanded={drawerOpen}
        aria-controls="app-sidebar"
        onclick={toggleDrawer}
      >
        <span class="hamburger-icon" aria-hidden="true">☰</span>
      </button>
      <span class="mobile-title">zux <span class="mobile-version">v{pkg.version}</span></span>
    </header>
    <button
      class="backdrop"
      class:open={drawerOpen}
      type="button"
      aria-label="Close menu"
      tabindex={drawerOpen ? 0 : -1}
      onclick={closeDrawer}
    ></button>
    <div class="graph-stack">
      <ServiceGraph />
      <NodeDetail />
    </div>
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: var(--bg-primary);
    font-family:
      'Inter Variable',
      system-ui,
      -apple-system,
      'Segoe UI',
      sans-serif;
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
    display: flex;
    flex-direction: column;
  }
  .mobile-header {
    display: none;
  }
  .backdrop {
    display: none;
  }
  .graph-stack {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  @media (max-width: 768px) {
    .layout {
      flex-direction: column;
    }
    .graph-area {
      display: flex;
      flex-direction: column;
    }
    .mobile-header {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      height: calc(48px + env(safe-area-inset-top));
      padding: env(safe-area-inset-top) 12px 0;
      box-sizing: border-box;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-primary);
      z-index: 10;
    }
    .hamburger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid var(--border-primary);
      border-radius: 6px;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
    }
    .hamburger:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .hamburger-icon {
      display: block;
      transform: translateY(-1px);
    }
    .mobile-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--accent);
    }
    .mobile-version {
      font-size: 11px;
      font-weight: 400;
      color: var(--text-muted);
    }
    .backdrop {
      display: block;
      position: absolute;
      inset: calc(48px + env(safe-area-inset-top)) 0 0 0;
      border: none;
      background: rgba(0, 0, 0, 0.45);
      opacity: 0;
      pointer-events: none;
      transition: opacity 200ms ease;
      z-index: 19;
      cursor: pointer;
    }
    .backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
  }
  @media (max-width: 768px) and (prefers-reduced-motion: reduce) {
    .backdrop {
      transition: none;
    }
  }
</style>
