<script lang="ts">
  import { stats, isScanning, physicsConfig } from './store';
  import { invoke } from '@tauri-apps/api/core';

  let physicsOpen = $state(false);

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
</script>

<aside class="sidebar">
  <h2 class="title">zux</h2>
  <p class="subtitle">mDNS-SD Browser</p>

  <div class="stats">
    <div class="stat"><span class="num">{$stats.types}</span> types</div>
    <div class="stat"><span class="num">{$stats.instances}</span> instances</div>
    <div class="stat"><span class="num">{$stats.hosts}</span> hosts</div>
    <div class="stat"><span class="num">{$stats.interfaces}</span> interfaces</div>
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
    <div class="legend-item"><span class="dot iface"></span> Interface</div>
    <div class="legend-item"><span class="dot addr"></span> Address</div>
  </div>

  <div class="section">
    <button class="section-toggle" onclick={() => physicsOpen = !physicsOpen}>
      <span class="arrow">{physicsOpen ? '▼' : '▶'}</span> Physics
    </button>
    {#if physicsOpen}
      <div class="physics-controls">
        <label class="ctrl">
          Solver
          <select value={$physicsConfig.solver} onchange={(e) => { const t = e.target as HTMLSelectElement; physicsConfig.set({ ...$physicsConfig, solver: t.value as import('./types').Solver }); }}>
            <option value="forceAtlas2Based">forceAtlas2Based</option>
            <option value="barnesHut">barnesHut</option>
            <option value="repulsion">repulsion</option>
            <option value="hierarchicalRepulsion">hierarchicalRepulsion</option>
          </select>
        </label>
        <label class="ctrl">
          Gravity <span class="val">{$physicsConfig.gravitationalConstant}</span>
          <input type="range" min="-200" max="0" step="1"
            value={$physicsConfig.gravitationalConstant}
            oninput={(e) => { const t = e.target as HTMLInputElement; physicsConfig.set({ ...$physicsConfig, gravitationalConstant: Number(t.value) }); }} />
        </label>
        <label class="ctrl">
          Cent. Gravity <span class="val">{$physicsConfig.centralGravity.toFixed(3)}</span>
          <input type="range" min="0" max="0.1" step="0.001"
            value={$physicsConfig.centralGravity}
            oninput={(e) => { const t = e.target as HTMLInputElement; physicsConfig.set({ ...$physicsConfig, centralGravity: Number(t.value) }); }} />
        </label>
        <label class="ctrl">
          Spring Len <span class="val">{$physicsConfig.springLength}</span>
          <input type="range" min="50" max="500" step="5"
            value={$physicsConfig.springLength}
            oninput={(e) => { const t = e.target as HTMLInputElement; physicsConfig.set({ ...$physicsConfig, springLength: Number(t.value) }); }} />
        </label>
        <label class="ctrl">
          Spring Const <span class="val">{$physicsConfig.springConstant.toFixed(3)}</span>
          <input type="range" min="0.001" max="0.1" step="0.001"
            value={$physicsConfig.springConstant}
            oninput={(e) => { const t = e.target as HTMLInputElement; physicsConfig.set({ ...$physicsConfig, springConstant: Number(t.value) }); }} />
        </label>
        <label class="ctrl">
          Damping <span class="val">{$physicsConfig.damping.toFixed(2)}</span>
          <input type="range" min="0" max="1" step="0.01"
            value={$physicsConfig.damping}
            oninput={(e) => { const t = e.target as HTMLInputElement; physicsConfig.set({ ...$physicsConfig, damping: Number(t.value) }); }} />
        </label>
      </div>
    {/if}
  </div>

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
  .dot.iface { background: #4dd0e1; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
  .dot.addr { background: #ce93d8; border-radius: 0; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
  .section {
    margin-top: 4px;
  }
  .section-toggle {
    background: none;
    border: none;
    color: #90a4ae;
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
    background: #1a1a2e;
    border-radius: 6px;
    margin-top: 4px;
  }
  .ctrl {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
    color: #b0bec5;
  }
  .ctrl select {
    appearance: none;
    background: #1a1a2e url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6' fill='%2378909c'/%3E%3C/svg%3E") no-repeat right 6px center;
    color: #b0bec5;
    border: 1px solid #16213e;
    border-radius: 4px;
    padding: 4px 22px 4px 6px;
    font-size: 11px;
    cursor: pointer;
  }
  .ctrl input[type="range"] {
    width: 100%;
    accent-color: #4fc3f7;
  }
  .val {
    float: right;
    color: #4fc3f7;
    font-weight: 600;
    font-size: 11px;
  }
</style>
