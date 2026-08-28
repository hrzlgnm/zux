<script lang="ts">
  import { get } from 'svelte/store'
  import { openUrl } from '@tauri-apps/plugin-opener'
  import { graphNodes, selectedNodeId } from './store'
  import type { GraphNode } from './types'

  let node = $state<GraphNode | null>(null)

  $effect(() => {
    const id = $selectedNodeId
    if (id) {
      node = get(graphNodes).get(id) ?? null
      const unsub = graphNodes.subscribe((nodes) => {
        node = nodes.get(id) ?? null
      })
      return unsub
    } else {
      node = null
    }
  })
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
        <div class="field">
          <span class="label">Addresses</span>
          {#each node.addresses as a (a.ip)}
            <div class="addr-row">
              <span class="addr-ip">{a.ip}</span>
              {#if a.interfaces.length > 0}
                <span class="addr-ifaces">({a.interfaces.join(', ')})</span>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
      {#if node.interfaces && node.interfaces.length > 0}
        <div class="field">
          <span class="label">Interfaces</span>
          <span>{node.interfaces.join(', ')}</span>
        </div>
      {/if}
      {#if node.txt && Object.keys(node.txt).length > 0}
        <div class="field"><span class="label">TXT Records</span></div>
        <div class="txt-records">
          {#each Object.entries(node.txt).sort(([a], [b]) => a.localeCompare(b)) as [k, v] (k)}
            <div class="txt-entry"><em>{k}</em>{v ? ` = ${v}` : ''}</div>
          {/each}
        </div>
      {/if}
      {#if node.urls && node.urls.length > 0}
        <div class="field">
          <span class="label">URLs</span>
          {#each node.urls as url (url)}
            <button
              class="url-link"
              onclick={() =>
                openUrl(url).catch((e) => console.warn('[zux] failed to open URL:', e))}
              >{url}</button
            >
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
    width: 640px;
    max-height: calc(100vh - 20px);
    overflow-y: auto;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    padding: 20px;
    color: var(--text-primary);
    z-index: 10;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }
  .close {
    position: absolute;
    top: 6px;
    right: 10px;
    background: none;
    border: none;
    color: var(--text-tertiary);
    font-size: 20px;
    cursor: pointer;
  }
  h3 {
    margin: 0 0 10px;
    font-size: 20px;
    color: var(--text-primary);
    word-break: break-all;
  }
  .meta {
    margin-bottom: 10px;
  }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
  }
  .type-service-type {
    background: var(--service-type-border);
    color: var(--service-type-font);
  }
  .type-instance {
    background: var(--instance-border);
    color: var(--instance-font);
  }
  .type-host {
    background: var(--host-border);
    color: var(--host-font);
  }
  .type-address {
    background: var(--address-bg);
    color: var(--address-font);
  }
  .fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .field {
    font-size: 14px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .field .label {
    color: var(--text-muted);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .field span {
    color: var(--text-primary);
    word-break: break-all;
    font-size: 14px;
  }
  .addr-row {
    display: flex;
    gap: 6px;
    align-items: baseline;
  }
  .addr-ip {
    color: var(--text-primary);
    word-break: break-all;
    font-size: 14px;
  }
  .addr-ifaces {
    color: var(--accent);
    font-size: 12px;
  }
  .txt-records {
    background: var(--bg-primary);
    border-radius: 4px;
    padding: 6px 8px;
    max-height: 300px;
    overflow-y: auto;
  }
  .txt-entry {
    font-size: 13px;
    color: var(--text-secondary);
    padding: 2px 0;
  }
  .txt-entry em {
    color: var(--accent);
    font-style: normal;
  }
  .url-link {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 13px;
    text-align: left;
    padding: 2px 0;
    cursor: pointer;
    text-decoration: underline;
    word-break: break-all;
  }
  .url-link:hover {
    color: var(--accent-hover);
  }
  @media (max-width: 768px) {
    .panel {
      top: auto;
      bottom: calc(10px + env(safe-area-inset-bottom));
      left: calc(10px + env(safe-area-inset-left));
      right: calc(10px + env(safe-area-inset-right));
      width: auto;
      max-height: calc(50dvh - env(safe-area-inset-bottom));
    }
  }
</style>
