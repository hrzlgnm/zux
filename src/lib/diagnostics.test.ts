// Copyright 2026 hrzlgnm
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest'
import { addressLabel, membershipAddresses, membershipLabel, socketLabel } from './diagnostics'
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

describe('addressLabel', () => {
  it('shows private, link-local, and loopback IPv4 addresses', () => {
    expect(
      ['10.0.0.1', '172.16.0.1', '172.31.255.255', '192.168.1.2', '169.254.1.2', '127.0.0.1'].map(
        addressLabel,
      ),
    ).toEqual([
      '10.0.0.1',
      '172.16.0.1',
      '172.31.255.255',
      '192.168.1.2',
      '169.254.1.2',
      '127.0.0.1',
    ])
  })

  it('redacts public and out-of-range IPv4 addresses', () => {
    expect(
      ['8.8.8.8', '172.32.0.1', '169.253.1.2', '192.169.1.2', '300.1.1.1'].map(addressLabel),
    ).toEqual(['redacted', 'redacted', 'redacted', 'redacted', 'redacted'])
  })

  it('shows link-local, unique-local, and loopback IPv6 addresses', () => {
    expect(['fe80::1', 'febf::1', 'fc00::1', 'fd00::1', '::1'].map(addressLabel)).toEqual([
      'fe80::1',
      'febf::1',
      'fc00::1',
      'fd00::1',
      '::1',
    ])
  })

  it('redacts public IPv6 addresses', () => {
    expect(
      ['fec0::1', '2001:db8::1', '2003:e8:bf14:ee00:dfc2:37eb:cc13:aa9a', '::ffff:8.8.8.8'].map(
        addressLabel,
      ),
    ).toEqual(['redacted', 'redacted', 'redacted', 'redacted'])
  })

  it('classifies IPv4-mapped IPv6 addresses by their IPv4 tail', () => {
    expect(['::ffff:192.168.1.2', '::ffff:127.0.0.1'].map(addressLabel)).toEqual([
      '::ffff:192.168.1.2',
      '::ffff:127.0.0.1',
    ])
  })
})
