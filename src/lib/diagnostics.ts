// Copyright 2026 hrzlgnm
// SPDX-License-Identifier: MIT

import type { EnabledInterface, Membership, SocketState } from './api'

// Human-readable labels for the sidebar's Diagnostics section. Membership
// addresses arrive numerically sorted from the daemon, so they are rendered
// in wire order.

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
