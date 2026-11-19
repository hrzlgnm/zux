// Copyright 2026 hrzlgnm
// SPDX-License-Identifier: MIT

import type { EnabledInterface, Membership, SocketState } from './api'

// Human-readable labels and screenshot-safe address rendering for the
// sidebar's Diagnostics section. Membership addresses arrive numerically
// sorted from the daemon, so they are rendered in wire order.

export function socketLabel(socket: SocketState): string {
  if (socket.bound) return 'bound'
  return socket.bind_error === null ? 'not bound' : `not bound (${socket.bind_error})`
}

export function membershipLabel(family: string, membership: Membership | null): string {
  if (membership === null) return `${family} none`
  if (membership.joined) return `${family} joined`
  return membership.join_error === null
    ? `${family} not joined`
    : `${family} not joined (${membership.join_error})`
}

// The interface's addresses of every family present, in wire order.
export function membershipAddresses(iface: EnabledInterface): Array<string> {
  return [...(iface.ipv4?.addresses ?? []), ...(iface.ipv6?.addresses ?? [])]
}

function isLocalIpv4(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  const octets: number[] = []
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return false
    const value = Number(part)
    if (value > 255) return false
    octets.push(value)
  }
  const first = octets[0] ?? 0
  const second = octets[1] ?? 0
  // RFC 1918 private, RFC 3927 link-local, and loopback ranges.
  return (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  )
}

function isLocalIpv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  if (lower === '::1') return true
  if (lower.startsWith('::ffff:')) return isLocalIpv4(lower.slice('::ffff:'.length))
  const first = lower.split(':')[0] ?? ''
  if (!/^[0-9a-f]{1,4}$/.test(first)) return false
  const value = parseInt(first, 16)
  // fe80::/10 link-local and fc00::/7 unique-local ranges.
  return (value >= 0xfe80 && value <= 0xfebf) || (value >= 0xfc00 && value <= 0xfdff)
}

export function isLocalAddress(ip: string): boolean {
  return ip.includes(':') ? isLocalIpv6(ip) : isLocalIpv4(ip)
}

// Screenshots of the diagnostics panel must not leak public addresses.
export function addressLabel(ip: string): string {
  return isLocalAddress(ip) ? ip : 'redacted'
}
