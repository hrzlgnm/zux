<script lang="ts">
  import { get } from 'svelte/store'
  import pkg from '../../package.json'
  import {
    stats,
    physicsConfig,
    filterQuery,
    disabledGroups,
    graphNetwork,
    resetPhysicsConfig,
    currentTheme,
    systemTheme,
    setTheme,
  } from './store'
  import { themes } from './themes'
  import type { Solver, ThemeName } from './types'

  let { open = false, onClose = () => {} }: { open?: boolean; onClose?: () => void } = $props()

  let physicsOpen = $state(false)

  const sortedThemes = (() => {
    const byName = new Map(themes.map((t) => [t.name, t]))
    const dark = byName.get('dark')
    const light = byName.get('light')
    const rest = themes
      .filter((t) => t.name !== 'dark' && t.name !== 'light')
      .sort((a, b) => a.label.localeCompare(b.label))
    return [dark, light, ...rest].filter((t): t is (typeof themes)[number] => Boolean(t))
  })()

  interface DropdownOption<T extends string> {
    value: T
    label: string
  }

  const themeOptions = $derived<DropdownOption<ThemeName>[]>([
    { value: 'system', label: $systemTheme === 'dark' ? 'System (Dark)' : 'System (Light)' },
    ...sortedThemes.map((t) => ({ value: t.name as ThemeName, label: t.label })),
  ])
  const themeLabel = $derived(
    themeOptions.find((o) => o.value === $currentTheme)?.label ?? $currentTheme,
  )

  const solverOptions: DropdownOption<Solver>[] = [
    { value: 'forceAtlas2Based', label: 'forceAtlas2Based' },
    { value: 'barnesHut', label: 'barnesHut' },
    { value: 'repulsion', label: 'repulsion' },
    { value: 'hierarchicalRepulsion', label: 'hierarchicalRepulsion' },
  ]
  const solverLabel = $derived(
    solverOptions.find((o) => o.value === $physicsConfig.solver)?.label ?? $physicsConfig.solver,
  )

  let themeOpen = $state(false)
  let themeActiveIndex = $state(-1)
  let themeTriggerEl: HTMLDivElement | undefined = $state(undefined)

  let solverOpen = $state(false)
  let solverActiveIndex = $state(-1)
  let solverTriggerEl: HTMLDivElement | undefined = $state(undefined)

  function closeTheme() {
    themeOpen = false
    themeActiveIndex = -1
  }

  function openThemeList() {
    themeOpen = true
    themeActiveIndex = themeOptions.findIndex((o) => o.value === $currentTheme)
  }

  function closeSolver() {
    solverOpen = false
    solverActiveIndex = -1
  }

  function openSolverList() {
    solverOpen = true
    solverActiveIndex = solverOptions.findIndex((o) => o.value === $physicsConfig.solver)
  }

  // Keeps the keyboard-navigated option visible; `nearest` scrolls the
  // listbox only, never the page.
  function scrollOptionIntoView(idPrefix: string, index: number) {
    document.getElementById(`${idPrefix}-${index}`)?.scrollIntoView({ block: 'nearest' })
  }

  function chooseTheme(value: ThemeName) {
    setTheme(value)
    closeTheme()
    themeTriggerEl?.focus()
  }

  function chooseSolver(value: Solver) {
    physicsConfig.set({ ...$physicsConfig, solver: value })
    closeSolver()
    solverTriggerEl?.focus()
  }

  function onThemeKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!themeOpen) {
        openThemeList()
      } else {
        const delta = e.key === 'ArrowDown' ? 1 : -1
        themeActiveIndex = (themeActiveIndex + delta + themeOptions.length) % themeOptions.length
        scrollOptionIntoView('theme-option', themeActiveIndex)
      }
    } else if ((e.key === 'Enter' || e.key === ' ') && !themeOpen) {
      e.preventDefault()
      openThemeList()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const selected = themeOptions[themeActiveIndex]
      if (selected !== undefined) chooseTheme(selected.value)
      else closeTheme()
    } else if (e.key === 'Escape' && themeOpen) {
      e.preventDefault()
      closeTheme()
    }
  }

  function onSolverKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!solverOpen) {
        openSolverList()
      } else {
        const delta = e.key === 'ArrowDown' ? 1 : -1
        solverActiveIndex =
          (solverActiveIndex + delta + solverOptions.length) % solverOptions.length
        scrollOptionIntoView('solver-option', solverActiveIndex)
      }
    } else if ((e.key === 'Enter' || e.key === ' ') && !solverOpen) {
      e.preventDefault()
      openSolverList()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const selected = solverOptions[solverActiveIndex]
      if (selected !== undefined) chooseSolver(selected.value)
      else closeSolver()
    } else if (e.key === 'Escape' && solverOpen) {
      e.preventDefault()
      closeSolver()
    }
  }

  function onDropdownFocusOut(close: () => void) {
    return (e: FocusEvent) => {
      // Keep the listbox open while focus moves to one of its options.
      const next = e.relatedTarget as Node | null
      if (next !== null && e.currentTarget instanceof Node && e.currentTarget.contains(next)) {
        return
      }
      close()
    }
  }

  async function exportSvg() {
    const network = get(graphNetwork)
    if (!network) {
      console.error('[zux] export failed: graphNetwork is null')
      return
    }
    try {
      // Loaded on demand: pulls in the export code and its embedded font
      const { exportGraphSvg } = await import('./svg-export.js')
      await exportGraphSvg(network)
    } catch (e) {
      console.error('[zux] export failed:', e)
    }
  }

  const legendItems: {
    key: string
    label: string
    dotClass: string
    countKey: 'types' | 'instances' | 'hosts' | 'addresses'
  }[] = [
    { key: 'service-type', label: 'Service Type', dotClass: 'type', countKey: 'types' },
    { key: 'instance', label: 'Instance', dotClass: 'inst', countKey: 'instances' },
    { key: 'host', label: 'Host', dotClass: 'host', countKey: 'hosts' },
    { key: 'address', label: 'Address', dotClass: 'addr', countKey: 'addresses' },
  ]

  function toggleGroup(key: string) {
    disabledGroups.update((s) => {
      if (s.has(key)) s.delete(key)
      else s.add(key)
      return s
    })
  }
</script>

<aside id="app-sidebar" class="sidebar" class:open aria-label="Filters and settings">
  <div class="drawer-header-row">
    <h2 class="title">zux <span class="version">v{pkg.version}</span></h2>
    <button class="drawer-close" type="button" aria-label="Close menu" onclick={onClose}
      >&times;</button
    >
  </div>
  <p class="subtitle">mDNS-SD Visualizer</p>

  <div class="ctrl">
    <span id="theme-label">Theme</span>
    <span class="dropdown-wrapper" onfocusout={onDropdownFocusOut(closeTheme)}>
      <div
        role="combobox"
        tabindex="0"
        class="dropdown-trigger"
        bind:this={themeTriggerEl}
        aria-labelledby="theme-label theme-value"
        aria-haspopup="listbox"
        aria-expanded={themeOpen}
        aria-controls="theme-listbox"
        aria-activedescendant={themeActiveIndex >= 0
          ? `theme-option-${themeActiveIndex}`
          : undefined}
        onclick={() => (themeOpen ? closeTheme() : openThemeList())}
        onkeydown={onThemeKeydown}
      >
        {themeLabel}
      </div>
      <span id="theme-value" class="visually-hidden">{themeLabel}</span>
      {#if themeOpen}
        <ul
          id="theme-listbox"
          class="dropdown-listbox"
          role="listbox"
          aria-labelledby="theme-label"
        >
          {#each themeOptions as option, i (option.value)}
            <li
              id={`theme-option-${i}`}
              role="option"
              aria-selected={option.value === $currentTheme}
              class:active={i === themeActiveIndex}
            >
              <button
                type="button"
                tabindex="-1"
                onmousedown={(e) => e.preventDefault()}
                onclick={() => chooseTheme(option.value)}
                onmousemove={() => (themeActiveIndex = i)}
              >
                {option.label}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </span>
  </div>

  <div class="stats">
    <div class="stat"><span class="num">{$stats.types}</span> types</div>
    <div class="stat"><span class="num">{$stats.instances}</span> instances</div>
    <div class="stat"><span class="num">{$stats.hosts}</span> hosts</div>
    <div class="stat"><span class="num">{$stats.addresses}</span> addresses</div>
    <div class="stat"><span class="num">{$stats.edges}</span> links</div>
  </div>

  <div class="legend">
    {#each legendItems as { key, label, dotClass, countKey } (key)}
      <label class="legend-item">
        <input
          type="checkbox"
          checked={!$disabledGroups.has(key)}
          onchange={() => toggleGroup(key)}
        />
        <span class="dot {dotClass}"></span>
        {label}
        <span class="legend-count">{$stats[countKey]}</span>
      </label>
    {/each}
    <div class="legend-item links-row">
      <span class="dot link-dot"></span> Links
      <span class="legend-count">{$stats.edges}</span>
    </div>
  </div>

  <div class="section">
    <button class="section-toggle" onclick={() => (physicsOpen = !physicsOpen)}>
      <span class="arrow">{physicsOpen ? '▼' : '▶'}</span> Physics
    </button>
    {#if physicsOpen}
      <div class="physics-controls">
        <div class="ctrl">
          <span id="solver-label">Solver</span>
          <span class="dropdown-wrapper" onfocusout={onDropdownFocusOut(closeSolver)}>
            <div
              role="combobox"
              tabindex="0"
              class="dropdown-trigger"
              bind:this={solverTriggerEl}
              aria-labelledby="solver-label solver-value"
              aria-haspopup="listbox"
              aria-expanded={solverOpen}
              aria-controls="solver-listbox"
              aria-activedescendant={solverActiveIndex >= 0
                ? `solver-option-${solverActiveIndex}`
                : undefined}
              onclick={() => (solverOpen ? closeSolver() : openSolverList())}
              onkeydown={onSolverKeydown}
            >
              {solverLabel}
            </div>
            <span id="solver-value" class="visually-hidden">{solverLabel}</span>
            {#if solverOpen}
              <ul
                id="solver-listbox"
                class="dropdown-listbox"
                role="listbox"
                aria-labelledby="solver-label"
              >
                {#each solverOptions as option, i (option.value)}
                  <li
                    id={`solver-option-${i}`}
                    role="option"
                    aria-selected={option.value === $physicsConfig.solver}
                    class:active={i === solverActiveIndex}
                  >
                    <button
                      type="button"
                      tabindex="-1"
                      onmousedown={(e) => e.preventDefault()}
                      onclick={() => chooseSolver(option.value)}
                      onmousemove={() => (solverActiveIndex = i)}
                    >
                      {option.label}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </span>
        </div>
        <label class="ctrl">
          Gravity <span class="val">{$physicsConfig.gravitationalConstant}</span>
          <input
            type="range"
            min="-200"
            max="0"
            step="1"
            value={$physicsConfig.gravitationalConstant}
            oninput={(e) => {
              const t = e.target as HTMLInputElement
              physicsConfig.set({ ...$physicsConfig, gravitationalConstant: Number(t.value) })
            }}
          />
        </label>
        <label class="ctrl">
          Cent. Gravity <span class="val">{$physicsConfig.centralGravity.toFixed(3)}</span>
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.001"
            value={$physicsConfig.centralGravity}
            oninput={(e) => {
              const t = e.target as HTMLInputElement
              physicsConfig.set({ ...$physicsConfig, centralGravity: Number(t.value) })
            }}
          />
        </label>
        <label class="ctrl">
          Spring Len <span class="val">{$physicsConfig.springLength}</span>
          <input
            type="range"
            min="50"
            max="500"
            step="5"
            value={$physicsConfig.springLength}
            oninput={(e) => {
              const t = e.target as HTMLInputElement
              physicsConfig.set({ ...$physicsConfig, springLength: Number(t.value) })
            }}
          />
        </label>
        <label class="ctrl">
          Spring Const <span class="val">{$physicsConfig.springConstant.toFixed(3)}</span>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={$physicsConfig.springConstant}
            oninput={(e) => {
              const t = e.target as HTMLInputElement
              physicsConfig.set({ ...$physicsConfig, springConstant: Number(t.value) })
            }}
          />
        </label>
        <label class="ctrl">
          Damping <span class="val">{$physicsConfig.damping.toFixed(2)}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={$physicsConfig.damping}
            oninput={(e) => {
              const t = e.target as HTMLInputElement
              physicsConfig.set({ ...$physicsConfig, damping: Number(t.value) })
            }}
          />
        </label>
        <button class="reset-btn" type="button" onclick={resetPhysicsConfig}>
          Reset to defaults
        </button>
      </div>
    {/if}
  </div>

  <input
    type="text"
    class="filter-input"
    placeholder="Filter nodes..."
    autocapitalize="none"
    autocomplete="off"
    autocorrect="off"
    spellcheck="false"
    bind:value={$filterQuery}
    onkeydown={(e) => {
      if (e.key === 'Escape') {
        $filterQuery = ''
      }
    }}
  />

  <button class="export-btn" onclick={exportSvg}>Export SVG</button>
</aside>

<style>
  .sidebar {
    width: 240px;
    height: 100%;
    background: var(--bg-secondary);
    color: var(--text-primary);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    border-right: 1px solid var(--border-primary);
    box-sizing: border-box;
  }
  .title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--accent);
  }
  .version {
    font-size: 11px;
    font-weight: 400;
    color: var(--text-muted);
  }
  .subtitle {
    margin: -8px 0 0;
    font-size: 12px;
    color: var(--text-muted);
  }
  .drawer-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .drawer-close {
    display: none;
    background: none;
    border: none;
    color: var(--text-tertiary);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    padding: 0 2px;
  }
  .drawer-close:hover {
    color: var(--text-primary);
  }
  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .stat {
    background: var(--bg-primary);
    border-radius: 6px;
    padding: 8px;
    text-align: center;
    font-size: 12px;
    color: var(--text-secondary);
  }
  .num {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }
  .legend {
    margin-top: 4px;
  }
  .legend-item {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
    cursor: pointer;
  }
  .legend-item input[type='checkbox'] {
    accent-color: var(--accent);
    cursor: pointer;
  }
  .legend-count {
    display: none;
    margin-left: auto;
    color: var(--accent);
    font-weight: 700;
  }
  .links-row {
    display: none;
  }
  .dot.link-dot {
    background: var(--text-tertiary);
    border-radius: 2px;
    transform: none;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }
  .dot.type {
    background: var(--service-type-bg);
    border-radius: 2px;
    transform: rotate(45deg);
  }
  .dot.inst {
    background: var(--instance-bg);
  }
  .dot.host {
    background: var(--host-bg);
    border-radius: 2px;
  }
  .dot.addr {
    background: var(--address-bg);
    border-radius: 0;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }
  .section {
    margin-top: 4px;
  }
  .section-toggle {
    background: none;
    border: none;
    color: var(--text-tertiary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 0;
    width: 100%;
    text-align: left;
  }
  .arrow {
    margin-right: 4px;
    font-size: 10px;
  }
  .physics-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    background: var(--bg-primary);
    border-radius: 6px;
    margin-top: 4px;
  }
  .ctrl {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
    color: var(--text-secondary);
  }
  .ctrl .dropdown-trigger {
    background: var(--bg-primary)
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6' fill='currentColor'/%3E%3C/svg%3E")
      no-repeat right 6px center;
    color: var(--text-secondary);
    border: 1px solid var(--bg-secondary);
    border-radius: 4px;
    padding: 4px 22px 4px 6px;
    font-size: 11px;
    cursor: pointer;
  }
  .ctrl .dropdown-trigger:focus {
    outline: none;
  }
  .ctrl .dropdown-trigger:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .dropdown-wrapper {
    position: relative;
    display: block;
  }
  .dropdown-listbox {
    position: absolute;
    z-index: 100;
    top: 100%;
    left: 0;
    right: 0;
    margin: 2px 0 0;
    padding: 0;
    list-style: none;
    max-height: 16rem;
    overflow-y: auto;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  }
  .dropdown-listbox button {
    display: block;
    width: 100%;
    padding: 4px 8px;
    font: inherit;
    font-size: 11px;
    text-align: left;
    background: transparent;
    color: var(--text-primary);
    border: 0;
    cursor: pointer;
  }
  .dropdown-listbox button:hover {
    background: var(--bg-tertiary);
  }
  .dropdown-listbox li.active button {
    background: var(--bg-tertiary);
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
  .dropdown-listbox li[aria-selected='true'] button {
    font-weight: 600;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .ctrl input[type='range'] {
    width: 100%;
    accent-color: var(--accent);
  }
  .val {
    float: right;
    color: var(--accent);
    font-weight: 600;
    font-size: 11px;
  }
  .filter-input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
  }
  .filter-input::placeholder {
    color: var(--text-placeholder);
  }
  .filter-input:focus {
    border-color: var(--accent);
  }
  .export-btn {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--accent);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .export-btn:hover {
    background: var(--bg-secondary);
    border-color: var(--accent);
  }
  .reset-btn {
    margin-top: 2px;
    padding: 6px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
  }
  .reset-btn:hover {
    background: var(--bg-secondary);
    border-color: var(--accent);
    color: var(--accent);
  }
  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      width: min(84vw, 320px);
      height: 100dvh;
      max-height: none;
      padding-top: calc(16px + env(safe-area-inset-top));
      padding-bottom: env(safe-area-inset-bottom);
      border-right: 1px solid var(--border-primary);
      border-bottom: none;
      z-index: 30;
      transform: translateX(-100%);
      transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
      box-shadow: 2px 0 16px rgba(0, 0, 0, 0.4);
    }
    .sidebar.open {
      transform: translateX(0);
    }
    .drawer-close {
      display: block;
    }
    .legend-count,
    .links-row {
      display: flex;
    }
  }
  @media (max-width: 768px) and (prefers-reduced-motion: reduce) {
    .sidebar {
      transition: none;
    }
  }
</style>
