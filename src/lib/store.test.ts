import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { get } from 'svelte/store'

vi.mock('./api', () => ({
  browseMany: vi.fn().mockResolvedValue(undefined),
  browseTypes: vi.fn().mockResolvedValue(undefined),
  stopBrowse: vi.fn().mockResolvedValue(undefined),
  localNetworkStatus: vi.fn().mockResolvedValue('granted'),
  onServiceResolved: vi.fn(),
  onServiceTypeFound: vi.fn(),
  onServiceRemoved: vi.fn(),
  onInterfacesChanged: vi.fn(),
  subscribeInterfaces: vi.fn().mockResolvedValue(undefined),
  linkLocalOnly: vi.fn().mockResolvedValue(true),
}))

const tauriMocks = vi.hoisted(() => ({ isTauri: true }))

vi.mock('@tauri-apps/api/core', () => ({
  isTauri: () => tauriMocks.isTauri,
}))

const storeData = vi.hoisted(() => ({ data: new Map<string, unknown>() }))

vi.mock('@tauri-apps/plugin-store', () => ({
  Store: {
    load: () =>
      Promise.resolve({
        get: (key: string) => Promise.resolve(storeData.data.get(key) ?? null),
        set: (key: string, value: unknown) => {
          storeData.data.set(key, value)
          return Promise.resolve()
        },
        save: () => Promise.resolve(),
      }),
  },
}))

import {
  graphNodes,
  serviceTypes,
  localAddresses,
  clearGraph,
  enqueueMdnsEvent,
  clearMdnsEventQueue,
  enqueueBrowseType,
  normalizeLocalIp,
  refreshLocalFlags,
  PHONE_SERVICE_TYPES,
  discoveryMode,
  startDiscovery,
  switchDiscoveryMode,
  localNetworkAccess,
  initDiscoveryMode,
  setDiscoveryMode,
  resetDiscoveryModeResolved,
} from './store'

function discovered(overrides: Record<string, unknown> = {}) {
  return {
    id: 'inst._http._tcp.local.',
    name: 'inst',
    service_type: '_http._tcp.local.',
    sub_type: null,
    hostname: 'host.local.',
    port: 80,
    addresses: [{ ip: '192.168.1.2', interfaces: ['eth0'] }],
    txt: {},
    urls: [],
    ...overrides,
  }
}

describe('mdns event batching', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearGraph()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('flushes queued events after 50ms', () => {
    enqueueMdnsEvent({ type: 'service-type-added', data: { service_type: '_http._tcp.local.' } })
    expect(get(serviceTypes).size).toBe(0)
    vi.advanceTimersByTime(50)
    expect(get(serviceTypes).has('_http._tcp.local.')).toBe(true)
    expect(get(graphNodes).has('type:_http._tcp.local.')).toBe(true)
  })

  it('flushes early at 200 queued events', () => {
    for (let i = 0; i < 200; i++) {
      enqueueMdnsEvent({
        type: 'service-added',
        data: discovered({ id: `inst${i}._http._tcp.local.`, name: `inst${i}` }),
      })
    }
    expect(get(graphNodes).size).toBeGreaterThan(0)
  })

  it('preserves add then remove ordering within one batch', () => {
    enqueueMdnsEvent({ type: 'service-type-added', data: { service_type: '_http._tcp.local.' } })
    enqueueMdnsEvent({ type: 'service-added', data: discovered() })
    enqueueMdnsEvent({
      type: 'service-removed',
      data: { id: 'inst', service_type: '_http._tcp.local.' },
    })
    vi.advanceTimersByTime(50)
    const node = get(graphNodes).get('inst:inst:_http._tcp.local.')
    expect(node?.offline).toBe(true)
  })

  it('groups browseMany calls per flush', async () => {
    const api = await import('./api')
    vi.mocked(api.browseMany).mockClear()
    enqueueBrowseType('_http._tcp.local.')
    enqueueBrowseType('_ssh._tcp.local.')
    enqueueMdnsEvent({ type: 'service-type-added', data: { service_type: '_http._tcp.local.' } })
    vi.advanceTimersByTime(50)
    expect(api.browseMany).toHaveBeenCalled()
    const callArgs = vi.mocked(api.browseMany).mock.calls[0]?.[0]
    expect(callArgs).toEqual(expect.arrayContaining(['_http._tcp.local.', '_ssh._tcp.local.']))
  })

  it('clears a pending batch without flushing', () => {
    enqueueMdnsEvent({ type: 'service-type-added', data: { service_type: '_http._tcp.local.' } })
    clearMdnsEventQueue()
    vi.advanceTimersByTime(50)
    expect(get(serviceTypes).size).toBe(0)
  })
})

describe('phone discovery mode', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearGraph()
    discoveryMode.set('all')
    resetDiscoveryModeResolved()
    storeData.data.clear()
    tauriMocks.isTauri = true
    localNetworkAccess.set('granted')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('lists nearby-sharing and wireless-debugging types only', () => {
    expect(PHONE_SERVICE_TYPES).toEqual([
      '_companion-link._tcp.local.',
      '_apple-mobdev2._tcp.local.',
      '_adb-tls-connect._tcp.local.',
      '_adb-tls-pairing._tcp.local.',
      '_adb._tcp.local.',
      '_FC9F5ED42C8A._tcp.local.',
    ])
  })

  it('browses all types by default', async () => {
    const api = await import('./api')
    vi.mocked(api.browseTypes).mockClear()
    vi.mocked(api.browseMany).mockClear()
    discoveryMode.set('all')
    await startDiscovery()
    expect(api.browseTypes).toHaveBeenCalled()
    expect(api.browseMany).not.toHaveBeenCalled()
  })

  it('browses only phone types in phones mode', async () => {
    const api = await import('./api')
    vi.mocked(api.browseTypes).mockClear()
    vi.mocked(api.browseMany).mockClear()
    discoveryMode.set('phones')
    await startDiscovery()
    expect(api.browseTypes).not.toHaveBeenCalled()
    expect(api.browseMany).toHaveBeenCalledWith(PHONE_SERVICE_TYPES)
  })

  it('switching mode clears the graph and restarts discovery', async () => {
    const api = await import('./api')
    vi.mocked(api.browseMany).mockClear()
    enqueueMdnsEvent({ type: 'service-type-added', data: { service_type: '_http._tcp.local.' } })
    vi.advanceTimersByTime(50)
    expect(get(serviceTypes).size).toBe(1)
    await switchDiscoveryMode('phones')
    expect(get(discoveryMode)).toBe('phones')
    expect(get(serviceTypes).size).toBe(0)
    expect(api.browseMany).toHaveBeenCalledWith(PHONE_SERVICE_TYPES)
  })

  it('switching to the current mode does not restart browsing', async () => {
    const api = await import('./api')
    vi.mocked(api.browseMany).mockClear()
    vi.mocked(api.browseTypes).mockClear()
    discoveryMode.set('all')
    await switchDiscoveryMode('all')
    expect(api.browseMany).not.toHaveBeenCalled()
    expect(api.browseTypes).not.toHaveBeenCalled()
  })

  it('switching while blocked stores the mode without clearing', async () => {
    const api = await import('./api')
    vi.mocked(api.browseMany).mockClear()
    localNetworkAccess.set('denied')
    enqueueMdnsEvent({ type: 'service-type-added', data: { service_type: '_http._tcp.local.' } })
    vi.advanceTimersByTime(50)
    expect(get(serviceTypes).size).toBe(1)
    await switchDiscoveryMode('phones')
    expect(get(discoveryMode)).toBe('phones')
    expect(get(serviceTypes).size).toBe(1)
    expect(api.browseMany).not.toHaveBeenCalled()
  })

  it('applies the pending reset when access returns', async () => {
    const api = await import('./api')
    vi.mocked(api.browseMany).mockClear()
    localNetworkAccess.set('denied')
    enqueueMdnsEvent({ type: 'service-type-added', data: { service_type: '_http._tcp.local.' } })
    vi.advanceTimersByTime(50)
    expect(get(serviceTypes).size).toBe(1)
    await switchDiscoveryMode('phones')
    expect(get(serviceTypes).size).toBe(1)
    localNetworkAccess.set('granted')
    await startDiscovery()
    expect(get(serviceTypes).size).toBe(0)
    expect(api.browseMany).toHaveBeenCalledWith(PHONE_SERVICE_TYPES)
  })

  it('init applies the saved mode when untouched', async () => {
    storeData.data.set('discoveryMode', 'phones')
    await initDiscoveryMode()
    expect(get(discoveryMode)).toBe('phones')
  })

  it('init does not clobber a choice made while loading', async () => {
    storeData.data.set('discoveryMode', 'all')
    setDiscoveryMode('phones')
    await initDiscoveryMode()
    expect(get(discoveryMode)).toBe('phones')
  })

  it('toggle in browser preview reseeds the sample graph', async () => {
    tauriMocks.isTauri = false
    const api = await import('./api')
    vi.mocked(api.browseMany).mockClear()
    await switchDiscoveryMode('phones')
    expect(get(discoveryMode)).toBe('phones')
    expect(api.browseMany).not.toHaveBeenCalled()
    expect(get(graphNodes).size).toBeGreaterThan(0)
    expect(get(serviceTypes).size).toBeGreaterThan(0)
  })
})

describe('local device highlighting', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearGraph()
    localAddresses.set(new Set())
  })

  afterEach(() => {
    vi.useRealTimers()
    localAddresses.set(new Set())
  })

  it('normalizes IPs for comparison', () => {
    expect(normalizeLocalIp('FE80::1%eth0')).toBe('fe80::1')
    expect(normalizeLocalIp('192.168.1.2')).toBe('192.168.1.2')
  })

  it('flags instance, host, and address nodes overlapping local interfaces', () => {
    localAddresses.set(new Set(['192.168.1.2']))
    enqueueMdnsEvent({ type: 'service-added', data: discovered() })
    vi.advanceTimersByTime(50)
    const nodes = get(graphNodes)
    expect(nodes.get('inst:inst:_http._tcp.local.')?.isLocal).toBe(true)
    expect(nodes.get('host:host.local.')?.isLocal).toBe(true)
    expect(nodes.get('addr:192.168.1.2')?.isLocal).toBe(true)
  })

  it('leaves remote services unflagged', () => {
    localAddresses.set(new Set(['10.0.0.1']))
    enqueueMdnsEvent({ type: 'service-added', data: discovered() })
    vi.advanceTimersByTime(50)
    const nodes = get(graphNodes)
    expect(nodes.get('inst:inst:_http._tcp.local.')?.isLocal).toBe(false)
    expect(nodes.get('host:host.local.')?.isLocal).toBe(false)
    expect(nodes.get('addr:192.168.1.2')?.isLocal).toBe(false)
  })

  it('re-evaluates flags when interfaces change', () => {
    enqueueMdnsEvent({ type: 'service-added', data: discovered() })
    vi.advanceTimersByTime(50)
    expect(get(graphNodes).get('host:host.local.')?.isLocal).toBe(false)
    localAddresses.set(new Set(['192.168.1.2']))
    refreshLocalFlags()
    expect(get(graphNodes).get('host:host.local.')?.isLocal).toBe(true)
    expect(get(graphNodes).get('addr:192.168.1.2')?.isLocal).toBe(true)
    localAddresses.set(new Set(['10.0.0.1']))
    refreshLocalFlags()
    expect(get(graphNodes).get('host:host.local.')?.isLocal).toBe(false)
  })

  it('keeps the local flag through an offline/online cycle', () => {
    localAddresses.set(new Set(['192.168.1.2']))
    enqueueMdnsEvent({ type: 'service-added', data: discovered() })
    vi.advanceTimersByTime(50)
    enqueueMdnsEvent({
      type: 'service-removed',
      data: { id: 'inst', service_type: '_http._tcp.local.' },
    })
    vi.advanceTimersByTime(50)
    const offline = get(graphNodes).get('inst:inst:_http._tcp.local.')
    expect(offline?.offline).toBe(true)
    expect(offline?.isLocal).toBe(true)
  })

  it('survives clearGraph so identity persists across rediscovery', () => {
    localAddresses.set(new Set(['192.168.1.2']))
    clearGraph()
    expect(get(localAddresses).has('192.168.1.2')).toBe(true)
    enqueueMdnsEvent({ type: 'service-added', data: discovered() })
    vi.advanceTimersByTime(50)
    expect(get(graphNodes).get('host:host.local.')?.isLocal).toBe(true)
  })
})
