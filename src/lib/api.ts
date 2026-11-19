// Copyright 2026 hrzlgnm
// SPDX-License-Identifier: MIT

import { invoke } from '@tauri-apps/api/core'

// mDNS discovery commands, events, and types are owned by
// tauri-plugin-mdns; re-export them here so frontend imports keep a
// single seam.
export {
  browseMany,
  browseTypes,
  localNetworkStatus,
  onDaemonStatusChanged,
  onServiceRemoved,
  onServiceResolved,
  onServiceTypeFound,
  onInterfacesChanged,
  requestLocalNetworkAccess,
  stopBrowse,
  subscribeDaemonStatus,
  subscribeInterfaces,
} from 'tauri-plugin-mdns-api'
export type {
  DaemonStatus,
  LocalNetworkState,
  Membership,
  NetworkInterface,
  ResolvedService,
  ScopedAddr,
  ServiceRemovedEvent,
  ServiceResolvedEvent,
  ServiceTypeFoundEvent,
  SocketState,
} from 'tauri-plugin-mdns-api'

// App commands still implemented by the backend itself.

export function linkLocalOnly(): Promise<boolean> {
  return invoke<boolean>('link_local_only')
}

export function canAutoUpdate(): Promise<boolean> {
  return invoke<boolean>('can_auto_update')
}

export function saveTextFile(path: string, contents: string): Promise<void> {
  return invoke<void>('save_text_file', { path, contents })
}
