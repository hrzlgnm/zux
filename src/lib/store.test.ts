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
  linkLocalOnly: vi.fn().mockResolvedValue(true),
}))

import {
  graphNodes,
  serviceTypes,
  clearGraph,
  enqueueMdnsEvent,
  clearMdnsEventQueue,
  enqueueBrowseType,
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
