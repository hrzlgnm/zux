<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import '@fontsource-variable/inter'
  import { isTauri } from '@tauri-apps/api/core'
  import type { UnlistenFn } from '@tauri-apps/api/event'
  import { confirm } from '@tauri-apps/plugin-dialog'
  import { relaunch } from '@tauri-apps/plugin-process'
  import { check } from '@tauri-apps/plugin-updater'
  import {
    check as checkAndroidUpdate,
    downloadAndInstall as installAndroidUpdate,
  } from 'tauri-plugin-android-update-api'
  import { canAutoUpdate, requestLocalNetworkAccess } from '#lib/api.js'
  import {
    setupEventListeners,
    clearGraph,
    seedPreviewData,
    initPhysicsConfig,
    initTheme,
    initLocalNetworkAccess,
    localNetworkAccess,
    startDiscovery,
    selectedNodeId,
    graphNetwork,
  } from '#lib/store.js'
  import { initLogger } from '#lib/logger.js'
  import Sidebar from '#lib/Sidebar.svelte'
  import NodeDetail from '#lib/NodeDetail.svelte'
  import pkg from '../../package.json'

  let unlisten: UnlistenFn | null = null
  let unlistenLogger: UnlistenFn | null = null
  let mounted = true
  let requesting = $state(false)
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

  async function requestAccess() {
    requesting = true
    try {
      const state = await requestLocalNetworkAccess()
      localNetworkAccess.set(state)
      if (state === 'granted') {
        await startDiscovery()
      }
    } catch (e) {
      console.warn('[zux] failed to request local network access:', e)
    } finally {
      requesting = false
    }
  }

  async function retryAccess() {
    const state = await initLocalNetworkAccess()
    if (state === 'granted') {
      await startDiscovery()
    }
  }

  onMount(async () => {
    if (isTauri()) {
      const loggerUnlisten = await initLogger()
      if (mounted) {
        unlistenLogger = loggerUnlisten
      } else {
        loggerUnlisten()
      }
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
      const access = await initLocalNetworkAccess()
      if (!mounted) return
      if (access === 'granted') {
        await startDiscovery()
      }
      checkForUpdates()
    } else {
      void initTheme()
      seedPreviewData()
      // No permission gate off-device; render the preview graph directly.
      localNetworkAccess.set('granted')
    }
  })

  onDestroy(() => {
    mounted = false
    if (unlisten) {
      unlisten()
      unlisten = null
    }
    if (unlistenLogger) {
      unlistenLogger()
      unlistenLogger = null
    }
  })

  async function checkForUpdates() {
    try {
      const canUpdate = await canAutoUpdate()
      if (!canUpdate) return
      if (/Android/i.test(navigator.userAgent)) {
        const update = await checkAndroidUpdate()
        if (!update) return
        const confirmed = await confirm(
          `A new version of zux (${update.version}) is available. Open the release page to download it?`,
          { title: 'Update available', kind: 'info' },
        )
        if (confirmed) {
          await installAndroidUpdate()
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
      {#if $localNetworkAccess === null}
        <!-- Access state still resolving; render nothing yet. -->
      {:else if $localNetworkAccess === 'granted'}
        {#await import('#lib/ServiceGraph.svelte')}
          <p class="graph-loading">Loading graph...</p>
        {:then { default: ServiceGraph }}
          <ServiceGraph />
        {:catch}
          <p class="graph-loading">Failed to load the graph view.</p>
        {/await}
        <NodeDetail />
      {:else}
        <div class="access-panel">
          <h2 class="access-title">Local network access required</h2>
          <p class="access-text">
            zux discovers services on your local network. Grant access to start browsing.
          </p>
          <div class="access-actions">
            <button
              type="button"
              class="access-button"
              onclick={requestAccess}
              disabled={requesting}
            >
              Grant access
            </button>
            <button type="button" class="access-button" onclick={retryAccess} disabled={requesting}>
              Check again
            </button>
          </div>
        </div>
      {/if}
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
  .graph-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin: 0;
    color: var(--text-secondary);
  }
  .access-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 100%;
    padding: 24px;
    text-align: center;
  }
  .access-title {
    margin: 0;
    font-size: 18px;
    color: var(--text-primary);
  }
  .access-text {
    margin: 0;
    max-width: 420px;
    color: var(--text-secondary);
  }
  .access-actions {
    display: flex;
    gap: 8px;
  }
  .access-button {
    padding: 8px 16px;
    border: 1px solid var(--border-accent);
    border-radius: 6px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
  }
  .access-button:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }
  .access-button:disabled {
    opacity: 0.5;
    cursor: default;
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
