export interface AddressInfo {
  ip: string
  interfaces: string[]
}

export interface ServiceDiscovered {
  id: string
  name: string
  service_type: string
  sub_type?: string | null
  hostname: string
  port: number
  addresses: AddressInfo[]
  txt: Record<string, string>
  urls: string[]
}

export type MdnsEvent =
  | { type: 'service-added'; data: ServiceDiscovered }
  | { type: 'service-removed'; data: { id: string; service_type: string } }
  | { type: 'service-type-added'; data: { service_type: string } }

export interface GraphNode {
  id: string
  label: string
  group: 'service-type' | 'instance' | 'host' | 'address'
  title?: string
  shape?: string
  size?: number
  color?: string | { background: string; border: string }
  font?: { color: string }
  serviceType?: string
  subType?: string
  hostname?: string
  port?: number
  addresses?: AddressInfo[]
  interfaces?: string[]
  txt?: Record<string, string>
  urls?: string[]
  offline?: boolean
}

export interface GraphEdge {
  id: string
  from: string
  to: string
  label?: string
  dashes?: boolean
  color?: string
}

export type Solver = 'forceAtlas2Based' | 'barnesHut' | 'repulsion' | 'hierarchicalRepulsion'

export interface PhysicsConfig {
  solver: Solver
  gravitationalConstant: number
  centralGravity: number
  springLength: number
  springConstant: number
  damping: number
}

export type ThemeName =
  | 'dark'
  | 'light'
  | 'solarized-dark'
  | 'solarized-light'
  | 'catppuccin-latte'
  | 'catppuccin-frappe'
  | 'catppuccin-macchiato'
  | 'catppuccin-mocha'

export interface ThemeColors {
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  borderPrimary: string
  borderAccent: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textTertiary: string
  textPlaceholder: string
  accent: string
  accentHover: string
  serviceTypeBg: string
  serviceTypeBorder: string
  serviceTypeFont: string
  instanceBg: string
  instanceBorder: string
  instanceFont: string
  hostBg: string
  hostBorder: string
  hostFont: string
  addressBg: string
  addressBorder: string
  addressFont: string
  edgeTypeInstance: string
  edgeInstanceHost: string
  edgeHostAddress: string
  offlineBg: string
  offlineBorder: string
  offlineFont: string
}

export interface ThemePreset {
  name: ThemeName
  label: string
  colors: ThemeColors
}
