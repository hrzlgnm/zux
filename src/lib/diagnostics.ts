// Copyright 2026 hrzlgnm
// SPDX-License-Identifier: MIT

import type { Membership, SocketState } from './api'

// Human-readable labels for the sidebar's Diagnostics section. Membership
// addresses arrive numerically sorted from the daemon, so they are rendered
// in wire order.

export function socketLabel(socket: SocketState): string {
  if (socket.bound) return 'bound'
  return socket.bind_error === null ? 'not bound' : `not bound (${socket.bind_error})`
}

export function membershipLabel(family: string, membership: Membership | null): string {
  if (membership === null) return `${family} none`
  const label = `${family} ${membership.joined ? 'joined' : 'not joined'}`
  const withAddrs =
    membership.addresses.length > 0 ? `${label} (${membership.addresses.join(', ')})` : label
  return membership.join_error === null ? withAddrs : `${withAddrs}: ${membership.join_error}`
}
