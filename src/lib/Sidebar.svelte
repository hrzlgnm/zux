<script lang="ts">
  import { stats, isScanning, graphNodes, graphEdges, serviceTypes } from './store';
  import { invoke } from '@tauri-apps/api/core';

  let activeTypes = $state<Set<string>>(new Set());
  let showAll = $state(true);

  function toggleType(t: string) {
    if (showAll) showAll = false;
    if (activeTypes.has(t)) activeTypes.delete(t);
    else activeTypes.add(t);
  }

  async function startScan() {
    isScanning.set(true);
    try {
      console.log('[zux] invoking start_discovery');
      await invoke('start_discovery');
      console.log('[zux] start_discovery completed');
    } catch (e) {
      console.error('[zux] invoke error:', e);
      isScanning.set(false);
    }
  }

  $effect(() => {
    const svc = $serviceTypes;
    if (svc.size > 0 && activeTypes.size === 0) {
      activeTypes = new Set(svc);
    }
  });
</script>

<aside class="sidebar">
  <h2 class="title">zux</h2>
  <p class="subtitle">mDNS-SD Browser</p>

  <div class="stats">
    <div class="stat"><span class="num">{$stats.types}</span> types</div>
    <div class="stat"><span class="num">{$stats.instances}</span> instances</div>
    <div class="stat"><span class="num">{$stats.hosts}</span> hosts</div>
    <div class="stat"><span class="num">{$stats.addresses}</span> addresses</div>
    <div class="stat"><span class="num">{$stats.edges}</span> links</div>
  </div>

  <button onclick={startScan} disabled={$isScanning} class="scan-btn">
    {$isScanning ? 'Scanning...' : 'Start Discovery'}
  </button>

  <div class="legend">
    <h3>Legend</h3>
    <div class="legend-item"><span class="dot type"></span> Service Type</div>
    <div class="legend-item"><span class="dot inst"></span> Instance</div>
    <div class="legend-item"><span class="dot host"></span> Host</div>
    <div class="legend-item"><span class="dot addr"></span> Address</div>
  </div>

  {#if $serviceTypes.size > 0}
    <div class="filters">
      <h3>Service Types</h3>
      <label class="filter-all">
        <input type="checkbox" bind:checked={showAll} /> Show All
      </label>
      {#each Array.from($serviceTypes) as st}
        <label class="filter-item">
          <input type="checkbox" checked={activeTypes.has(st)}
            onchange={() => toggleType(st)} />
          {st.replace('.local.', '')}
        </label>
      {/each}
    </div>
  {/if}
</aside>

<style>
  .sidebar {
    width: 240px;
    height: 100%;
    background: #16213e;
    color: #e0e0e0;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    border-right: 1px solid #0f3460;
    box-sizing: border-box;
  }
  .title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #4fc3f7;
  }
  .subtitle {
    margin: -8px 0 0;
    font-size: 12px;
    color: #78909c;
  }
  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .stat {
    background: #1a1a2e;
    border-radius: 6px;
    padding: 8px;
    text-align: center;
    font-size: 12px;
    color: #b0bec5;
  }
  .num {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: #e0e0e0;
  }
  .scan-btn {
    padding: 10px;
    border: none;
    border-radius: 6px;
    background: #4fc3f7;
    color: #0d1117;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
  }
  .scan-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .legend {
    margin-top: 4px;
  }
  .legend h3 {
    font-size: 13px;
    margin: 0 0 6px;
    color: #90a4ae;
  }
  .legend-item {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }
  .dot.type { background: #4fc3f7; border-radius: 2px; transform: rotate(45deg); }
  .dot.inst { background: #81c784; }
  .dot.host { background: #ffb74d; border-radius: 2px; }
  .dot.addr { background: #ce93d8; border-radius: 0; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
  .filters {
    margin-top: 4px;
  }
  .filters h3 {
    font-size: 13px;
    margin: 0 0 6px;
    color: #90a4ae;
  }
  .filter-all, .filter-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    padding: 3px 0;
    cursor: pointer;
  }
  .filter-all input, .filter-item input {
    accent-color: #4fc3f7;
  }
</style>
