import type { ResolvedService, ScopedAddr } from 'tauri-plugin-mdns-api'
import type { AddressInfo, GraphNode, ServiceDiscovered } from './types'

// Converts the plugin's `ResolvedService` to the graph's
// `ServiceDiscovered`: instance-name extraction, link-local address
// filtering, and URL derivation.

export function cleanHostname(hostname: string): string {
  return hostname.replace('.local.', '.').replace(/\.+$/, '')
}

export function urlHostname(hostname: string): string {
  const host = cleanHostname(hostname)
  return `${host.replace(/\.local$/, '')}.local`
}

export function formatUrl(scheme: string, host: string, port: number, path: string): string {
  const defaultPort = scheme === 'http' ? 80 : scheme === 'https' ? 443 : undefined
  if (defaultPort === port) {
    return `${scheme}://${host}${path}`
  }
  return `${scheme}://${host}:${port}${path}`
}

function isUnicastLinkLocal(ip: string): boolean {
  const firstGroup = ip.split(':')[0]
  if (!firstGroup) return false
  const value = parseInt(firstGroup, 16)
  return Number.isInteger(value) && value >= 0xfe80 && value <= 0xfebf
}

function parseIpv4(s: string): number[] | null {
  const parts = s.split('.')
  if (parts.length !== 4) return null
  const out: number[] = []
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part ?? '')) return null
    const n = parseInt(part, 10)
    if (n < 0 || n > 255) return null
    out.push(n)
  }
  return out
}

function parseHextets(text: string): number[] | null {
  if (text === '') return []
  const out: number[] = []
  for (const part of text.split(':')) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(part ?? '')) return null
    out.push(parseInt(part, 16))
  }
  return out
}

// Parses an IPv6 literal into sixteen bytes in network order. Handles `::`
// compression and embedded IPv4 tails such as `::ffff:192.168.0.1`.
function parseIpv6(s: string): number[] | null {
  let text = s
  if (text.includes('.')) {
    const tail = text.slice(text.lastIndexOf(':') + 1)
    const v4 = parseIpv4(tail)
    if (v4 === null) return null
    const prefix = text.slice(0, text.length - tail.length)
    const high = ((v4[0] ?? 0) * 256 + (v4[1] ?? 0)).toString(16)
    const low = ((v4[2] ?? 0) * 256 + (v4[3] ?? 0)).toString(16)
    text = `${prefix}${high}:${low}`
  }
  const halves = text.split('::')
  if (halves.length > 2) return null
  let groups: number[]
  if (halves.length === 2) {
    const left = parseHextets(halves[0] ?? '')
    const right = parseHextets(halves[1] ?? '')
    if (left === null || right === null) return null
    const fill = 8 - (left.length + right.length)
    if (fill < 1) return null
    groups = [...left, ...new Array<number>(fill).fill(0), ...right]
  } else {
    const parsed = parseHextets(text)
    if (parsed === null || parsed.length !== 8) return null
    groups = parsed
  }
  const out: number[] = []
  for (const group of groups) {
    out.push((group >> 8) & 0xff, group & 0xff)
  }
  return out
}

// Numeric IP ordering for URL hosts, with IPv4 before IPv6. Returns null
// unless both hosts parse as IP addresses, so mixed and non-IP hosts keep
// the previous lexicographic order.
function compareIpHosts(a: string, b: string): number | null {
  const a4 = parseIpv4(a)
  const b4 = parseIpv4(b)
  if (a4 !== null && b4 !== null) {
    for (let i = 0; i < 4; i++) {
      if (a4[i] !== b4[i]) return (a4[i] ?? 0) - (b4[i] ?? 0)
    }
    return 0
  }
  const a6 = parseIpv6(a)
  const b6 = parseIpv6(b)
  if (a6 !== null && b6 !== null) {
    for (let i = 0; i < 16; i++) {
      if (a6[i] !== b6[i]) return (a6[i] ?? 0) - (b6[i] ?? 0)
    }
    return 0
  }
  if (a4 !== null && b6 !== null) return -1
  if (a6 !== null && b4 !== null) return 1
  return null
}

function urlHost(url: string): string {
  try {
    // WHATWG URL keeps the brackets on IPv6 literals; strip them so the
    // host parses as an IP address.
    return new URL(url).hostname.replace(/^\[(.*)\]$/, '$1')
  } catch {
    return url
  }
}

// Lexicographic URL order misorders same-family IPs (`...0.155` before
// `...0.2`), so compare numeric IP hosts by value and fall back to string
// order otherwise.
function compareUrls(a: string, b: string): number {
  const ha = urlHost(a)
  const hb = urlHost(b)
  if (ha !== hb) {
    const ipOrder = compareIpHosts(ha, hb)
    if (ipOrder !== null && ipOrder !== 0) return ipOrder
  }
  return a < b ? -1 : a > b ? 1 : 0
}

export function keepAddress(addr: string, linkLocalOnly: boolean): boolean {
  if (!linkLocalOnly) return true
  if (!addr.includes(':')) return true
  return isUnicastLinkLocal(addr)
}

export function deriveUrls(
  serviceType: string,
  hostname: string,
  port: number,
  txt: Record<string, string>,
  addresses: AddressInfo[],
): string[] {
  const urls: string[] = []
  const lowerType = serviceType.toLowerCase()
  let path = '/'
  // TXT keys are case-insensitive (RFC 6763, section 6.4).
  const txtPath = Object.entries(txt)
    .find(([key]) => key.toLowerCase() === 'path')?.[1]
    ?.trim()
  if (txtPath) {
    path = txtPath.startsWith('/') ? txtPath : `/${txtPath}`
  }

  if (lowerType.startsWith('_http._tcp') || lowerType.startsWith('_https._tcp')) {
    const scheme = lowerType.startsWith('_https._tcp') ? 'https' : 'http'
    const host = urlHostname(hostname)
    urls.push(formatUrl(scheme, host, port, path))
    for (const a of addresses) {
      // Link-local addresses need a scope id and are unusable in URLs.
      if (a.ip.toLowerCase().startsWith('fe80:')) continue
      const addr = a.ip.includes(':') ? `[${a.ip}]` : a.ip
      const u = formatUrl(scheme, addr, port, path)
      if (!urls.includes(u)) urls.push(u)
    }
  }

  for (const value of Object.values(txt)) {
    try {
      const parsed = new URL(value.trim())
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        const s = parsed.toString()
        if (!urls.includes(s)) urls.push(s)
      }
    } catch {
      // Not an absolute URL; TXT values are free-form.
    }
  }

  urls.sort(compareUrls)
  return urls
}

function stripSuffix(s: string, suffix: string): string | undefined {
  return s.endsWith(suffix) ? s.slice(0, s.length - suffix.length) : undefined
}

export function instanceName(instanceFullname: string, serviceType: string): string {
  const suffix = serviceType.replace(/\.+$/, '')
  const clean = instanceFullname.replace(/\.+$/, '')
  const withoutType = stripSuffix(clean, suffix)
  if (withoutType === undefined) return ''
  return stripSuffix(withoutType, '.') ?? ''
}

export function resolvedToDiscovered(
  service: ResolvedService,
  linkLocalOnly: boolean,
): ServiceDiscovered {
  const serviceType = service.service_type
  const txt: Record<string, string> = Object.fromEntries(
    service.txt.map((t) => [t.key, t.val ?? '']),
  )
  const addresses: AddressInfo[] = service.addresses
    .filter((a: ScopedAddr) => keepAddress(a.addr, linkLocalOnly))
    .map((a: ScopedAddr) => ({
      ip: a.addr,
      interfaces: a.interfaces.map((i) => i.name),
    }))
  return {
    id: service.instance_fullname,
    name: instanceName(service.instance_fullname, serviceType),
    service_type: serviceType,
    sub_type: service.subtype,
    hostname: service.hostname,
    port: service.port,
    addresses,
    txt,
    urls: deriveUrls(serviceType, service.hostname, service.port, txt, addresses),
  }
}

// Whether any graph node is marked offline. Records expire while the app
// is suspended (the querier's query loop stalls with the CPU), so callers
// restart instance browsing on foregrounding when this is true.
export function hasOfflineNodes(nodes: Map<string, GraphNode>): boolean {
  for (const node of nodes.values()) {
    if (node.offline) return true
  }
  return false
}
