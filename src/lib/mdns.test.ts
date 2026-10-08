import { describe, expect, it } from 'vitest'
import {
  cleanHostname,
  deriveUrls,
  formatUrl,
  hasOfflineNodes,
  instanceName,
  keepAddress,
  urlHostname,
} from './mdns'
import type { GraphNode } from './types'

function node(id: string, offline?: boolean): GraphNode {
  return { id, label: id, group: 'instance', offline }
}

describe('formatUrl', () => {
  it('omits the default port', () => {
    expect(formatUrl('http', 'printer.local', 80, '/ipp')).toBe('http://printer.local/ipp')
    expect(formatUrl('https', 'printer.local', 443, '/')).toBe('https://printer.local/')
  })

  it('keeps a non-default port', () => {
    expect(formatUrl('http', 'printer.local', 8080, '/')).toBe('http://printer.local:8080/')
    expect(formatUrl('https', 'printer.local', 8443, '/ipp')).toBe('https://printer.local:8443/ipp')
  })

  it('passes bracketed IPv6 hosts through', () => {
    expect(formatUrl('https', '[::1]', 443, '/')).toBe('https://[::1]/')
    expect(formatUrl('http', '[::1]', 8080, '/')).toBe('http://[::1]:8080/')
  })
})

describe('cleanHostname', () => {
  it('strips the .local domain', () => {
    expect(cleanHostname('printer.local.')).toBe('printer')
    expect(cleanHostname('printer.local')).toBe('printer.local')
  })
})

describe('urlHostname', () => {
  it('keeps the .local domain', () => {
    expect(urlHostname('printer.local.')).toBe('printer.local')
    expect(urlHostname('printer.local')).toBe('printer.local')
  })
})

describe('instanceName', () => {
  it('extracts the first label', () => {
    expect(instanceName('My Printer._http._tcp.local.', '_http._tcp.local.')).toBe('My Printer')
  })

  it('returns empty for a non-matching type', () => {
    expect(instanceName('My Printer._http._tcp.local.', '_ssh._tcp.local.')).toBe('')
  })
})

describe('keepAddress', () => {
  it('keeps everything when not link-local-only', () => {
    expect(keepAddress('192.168.1.2', false)).toBe(true)
    expect(keepAddress('2001:db8::1', false)).toBe(true)
  })

  it('keeps IPv4 and drops global IPv6 when link-local-only', () => {
    expect(keepAddress('192.168.1.2', true)).toBe(true)
    expect(keepAddress('fe80::1', true)).toBe(true)
    expect(keepAddress('2001:db8::1', true)).toBe(false)
  })
})

describe('deriveUrls', () => {
  it('derives host and IP URLs for http services', () => {
    const urls = deriveUrls('_http._tcp.local.', 'printer.local.', 80, {}, [
      { ip: '192.168.1.2', interfaces: ['wlan0'] },
      { ip: 'fe80::1', interfaces: ['wlan0'] },
    ])
    expect(urls).toEqual(['http://192.168.1.2/', 'http://printer.local/'])
  })

  it('honors the txt path and scrapes http(s) TXT values', () => {
    const urls = deriveUrls(
      '_https._tcp.local.',
      'printer.local.',
      8443,
      { path: 'ipp', admin: 'https://example.com/admin' },
      [],
    )
    expect(urls).toEqual(['https://example.com/admin', 'https://printer.local:8443/ipp'])
  })

  it('derives nothing for non-http services without URL TXT values', () => {
    expect(deriveUrls('_ssh._tcp.local.', 'host.local.', 22, {}, [])).toEqual([])
  })

  it('matches the TXT path key case-insensitively', () => {
    const urls = deriveUrls('_http._tcp.local.', 'printer.local.', 80, { Path: 'status' }, [])
    expect(urls).toEqual(['http://printer.local/status'])
  })

  it('orders IP URLs numerically, not lexicographically', () => {
    const urls = deriveUrls('_http._tcp.local.', 'printer.local.', 8080, {}, [
      { ip: '192.168.0.155', interfaces: ['wlan0'] },
      { ip: '192.168.0.2', interfaces: ['wlan0'] },
    ])
    expect(urls).toEqual([
      'http://192.168.0.2:8080/',
      'http://192.168.0.155:8080/',
      'http://printer.local:8080/',
    ])
  })

  it('orders IPv6 URLs numerically', () => {
    const urls = deriveUrls('_http._tcp.local.', 'printer.local.', 8080, {}, [
      { ip: '2001:db8::10', interfaces: ['wlan0'] },
      { ip: '2001:db8::2', interfaces: ['wlan0'] },
    ])
    expect(urls).toEqual([
      'http://[2001:db8::2]:8080/',
      'http://[2001:db8::10]:8080/',
      'http://printer.local:8080/',
    ])
  })

  it('falls back to string order for numerically equal IP hosts', () => {
    const urls = deriveUrls('_http._tcp.local.', 'printer.local.', 8080, {}, [
      { ip: '192.168.0.2', interfaces: ['wlan0'] },
      { ip: '192.168.0.002', interfaces: ['wlan0'] },
    ])
    expect(urls).toEqual([
      'http://192.168.0.002:8080/',
      'http://192.168.0.2:8080/',
      'http://printer.local:8080/',
    ])
  })
})

describe('hasOfflineNodes', () => {
  it('returns false for an empty graph', () => {
    expect(hasOfflineNodes(new Map())).toBe(false)
  })

  it('returns false when all nodes are online', () => {
    const nodes = new Map([
      ['a', node('a', false)],
      ['b', node('b')],
    ])
    expect(hasOfflineNodes(nodes)).toBe(false)
  })

  it('returns true when any node is offline', () => {
    const nodes = new Map([
      ['a', node('a', false)],
      ['b', node('b', true)],
    ])
    expect(hasOfflineNodes(nodes)).toBe(true)
  })
})
