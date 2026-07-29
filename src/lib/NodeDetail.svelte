<script lang="ts">
  import { graphNodes, selectedNodeId } from './store';
  import type { GraphNode } from './types';

  let node = $state<GraphNode | null>(null);

  $effect(() => {
    const id = $selectedNodeId;
    if (id) {
      const unsub = graphNodes.subscribe(nodes => {
        node = nodes.get(id) ?? null;
      });
      return unsub;
    } else {
      node = null;
    }
  });
</script>

{#if node}
  <div class="panel">
    <button class="close" onclick={() => selectedNodeId.set(null)}>&times;</button>
    <h3>{node.label}</h3>
    <div class="meta">
      <span class="badge type-{node.group}">{node.group}</span>
    </div>
    <div class="fields">
      {#if node.serviceType}
        <div class="field"><span class="label">Type</span><span>{node.serviceType}</span></div>
      {/if}
      {#if node.subType}
        <div class="field"><span class="label">Subtype</span><span>{node.subType}</span></div>
      {/if}
      {#if node.hostname}
        <div class="field"><span class="label">Hostname</span><span>{node.hostname}</span></div>
      {/if}
      {#if node.port}
        <div class="field"><span class="label">Port</span><span>{node.port}</span></div>
      {/if}
      {#if node.addresses && node.addresses.length > 0}
        <div class="field"><span class="label">Addresses</span>
          <span>{node.addresses.join(', ')}</span>
        </div>
      {/if}
      {#if node.txt && Object.keys(node.txt).length > 0}
        <div class="field"><span class="label">TXT Records</span></div>
        <div class="txt-records">
          {#each Object.entries(node.txt).sort(([a], [b]) => a.localeCompare(b)) as [k, v]}
            <div class="txt-entry"><em>{k}</em> = {v || '(empty)'}</div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .panel {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 360px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    background: #16213e;
    border: 1px solid #0f3460;
    border-radius: 8px;
    padding: 16px;
    color: #e0e0e0;
    z-index: 10;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .close {
    position: absolute;
    top: 6px;
    right: 10px;
    background: none;
    border: none;
    color: #90a4ae;
    font-size: 20px;
    cursor: pointer;
  }
  h3 {
    margin: 0 0 8px;
    font-size: 15px;
    color: #e0e0e0;
    word-break: break-all;
  }
  .meta { margin-bottom: 10px; }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
  .type-service-type { background: #0288d1; color: #e1f5fe; }
  .type-instance { background: #388e3c; color: #e8f5e9; }
  .type-host { background: #f57c00; color: #fff3e0; }
  .fields {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field {
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .field .label {
    color: #78909c;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .field span { color: #e0e0e0; word-break: break-all; }
  .txt-records {
    background: #1a1a2e;
    border-radius: 4px;
    padding: 6px 8px;
    max-height: 300px;
    overflow-y: auto;
  }
  .txt-entry {
    font-size: 11px;
    color: #b0bec5;
    padding: 1px 0;
  }
  .txt-entry em {
    color: #80cbc4;
    font-style: normal;
  }
</style>
