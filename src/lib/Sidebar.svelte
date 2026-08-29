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
  import { exportGraphSvg } from './svg-export'
  import type { Solver, ThemeName } from './types'

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

  async function exportSvg() {
    const network = get(graphNetwork)
    if (!network) {
      console.error('[zux] export failed: graphNetwork is null')
      return
    }
    try {
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

<aside class="sidebar">
  <h2 class="title">zux <span class="version">v{pkg.version}</span></h2>
  <p class="subtitle">mDNS-SD Visualizer</p>

  <label class="ctrl">
    Theme
    <select
      value={$currentTheme}
      onchange={(e) => {
        const t = e.target as HTMLSelectElement
        setTheme(t.value as ThemeName)
      }}
    >
      <option value="system">{$systemTheme === 'dark' ? 'System (Dark)' : 'System (Light)'}</option>
      {#each sortedThemes as theme (theme.name)}
        <option value={theme.name}>{theme.label}</option>
      {/each}
    </select>
  </label>

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
        <label class="ctrl">
          Solver
          <select
            value={$physicsConfig.solver}
            onchange={(e) => {
              const t = e.target as HTMLSelectElement
              physicsConfig.set({ ...$physicsConfig, solver: t.value as Solver })
            }}
          >
            <option value="forceAtlas2Based">forceAtlas2Based</option>
            <option value="barnesHut">barnesHut</option>
            <option value="repulsion">repulsion</option>
            <option value="hierarchicalRepulsion">hierarchicalRepulsion</option>
          </select>
        </label>
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
  .ctrl select {
    appearance: none;
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
      width: 100%;
      height: auto;
      max-height: 40vh;
      max-height: 40dvh;
      padding-top: calc(16px + env(safe-area-inset-top));
      border-right: none;
      border-bottom: 1px solid var(--border-primary);
    }
    .stats {
      display: none;
    }
    .legend-count,
    .links-row {
      display: flex;
    }
  }
</style>
