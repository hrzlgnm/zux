// Copyright 2026 hrzlgnm
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest'
import { membershipLabel, socketLabel } from './diagnostics'
import type { Membership } from './api'

describe('socketLabel', () => {
  it('labels a bound socket', () => {
    expect(socketLabel({ bound: true, bind_error: null })).toBe('bound')
  })

  it('labels an unbound socket without an error', () => {
    expect(socketLabel({ bound: false, bind_error: null })).toBe('not bound')
  })

  it('appends the bind error to an unbound socket', () => {
    expect(socketLabel({ bound: false, bind_error: 'address in use' })).toBe(
      'not bound (address in use)',
    )
  })
})

describe('membershipLabel', () => {
  it('labels a missing family as none', () => {
    expect(membershipLabel('IPv4', null)).toBe('IPv4 none')
  })

  it('lists the joined addresses in wire order', () => {
    const membership: Membership = {
      addresses: ['192.168.1.2', '192.168.1.10'],
      joined: true,
      join_error: null,
    }
    expect(membershipLabel('IPv4', membership)).toBe('IPv4 joined (192.168.1.2, 192.168.1.10)')
  })

  it('leaves a membership without addresses unparenthesized', () => {
    const membership: Membership = { addresses: [], joined: true, join_error: null }
    expect(membershipLabel('IPv6', membership)).toBe('IPv6 joined')
  })

  it('appends the join error after the addresses', () => {
    const membership: Membership = {
      addresses: ['192.168.1.2'],
      joined: false,
      join_error: 'no route to host',
    }
    expect(membershipLabel('IPv4', membership)).toBe(
      'IPv4 not joined (192.168.1.2): no route to host',
    )
  })

  it('appends the join error without addresses', () => {
    const membership: Membership = { addresses: [], joined: false, join_error: 'down' }
    expect(membershipLabel('IPv6', membership)).toBe('IPv6 not joined: down')
  })

  it('shows a stale join error on a joined membership', () => {
    const membership: Membership = {
      addresses: ['192.168.1.2'],
      joined: true,
      join_error: 'timed out',
    }
    expect(membershipLabel('IPv4', membership)).toBe('IPv4 joined (192.168.1.2): timed out')
  })
})
