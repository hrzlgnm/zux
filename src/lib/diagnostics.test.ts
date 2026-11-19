// Copyright 2026 hrzlgnm
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest'
import { membershipAddresses, membershipLabel, socketLabel } from './diagnostics'
import type { EnabledInterface, Membership } from './api'

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

  it('labels a joined membership', () => {
    const membership: Membership = { addresses: ['192.168.1.2'], joined: true, join_error: null }
    expect(membershipLabel('IPv4', membership)).toBe('IPv4 joined')
  })

  it('labels a not-joined membership without an error', () => {
    const membership: Membership = { addresses: ['192.168.1.2'], joined: false, join_error: null }
    expect(membershipLabel('IPv4', membership)).toBe('IPv4 not joined')
  })

  it('appends the join error', () => {
    const membership: Membership = {
      addresses: ['192.168.1.2'],
      joined: false,
      join_error: 'no route to host',
    }
    expect(membershipLabel('IPv4', membership)).toBe('IPv4 not joined (no route to host)')
  })

  it('hides a stale join error on a joined membership', () => {
    const membership: Membership = {
      addresses: ['192.168.1.2'],
      joined: true,
      join_error: 'timed out',
    }
    expect(membershipLabel('IPv4', membership)).toBe('IPv4 joined')
  })
})

describe('membershipAddresses', () => {
  const ipv4: Membership = {
    addresses: ['192.168.1.2', '192.168.1.10'],
    joined: true,
    join_error: null,
  }
  const ipv6: Membership = {
    addresses: ['fe80::a1b2:c3d4:eeee:0'],
    joined: false,
    join_error: null,
  }

  it('collects the addresses of every family present, in wire order', () => {
    const iface: EnabledInterface = { name: 'wlan0', index: 2, ipv4, ipv6 }
    expect(membershipAddresses(iface)).toEqual([
      '192.168.1.2',
      '192.168.1.10',
      'fe80::a1b2:c3d4:eeee:0',
    ])
  })

  it('skips missing families', () => {
    const iface: EnabledInterface = { name: 'eth0', index: 1, ipv4, ipv6: null }
    expect(membershipAddresses(iface)).toEqual(['192.168.1.2', '192.168.1.10'])
  })
})
