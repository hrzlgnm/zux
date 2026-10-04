import type { ResolvedService, ScopedAddr } from 'tauri-plugin-mdns-api'
import type { AddressInfo, ServiceDiscovered } from './types'

// Conversion from the plugin's `ResolvedService` to the graph's
// `ServiceDiscovered`, ported from the former Rust engine: instance-name
// extraction, link-local address filtering, and URL derivation.

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
  const ty = serviceType.toLowerCase()
  let path = '/'
  const txtPath = txt['path']?.trim()
  if (txtPath) {
    path = txtPath.startsWith('/') ? txtPath : `/${txtPath}`
  }

  if (ty.startsWith('_http._tcp') || ty.startsWith('_https._tcp')) {
    const scheme = ty.startsWith('_https._tcp') ? 'https' : 'http'
    const host = urlHostname(hostname)
    urls.push(formatUrl(scheme, host, port, path))
    for (const a of addresses) {
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

  urls.sort()
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
