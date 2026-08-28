import type { Network, Node, Edge, Position, IdType } from 'vis-network'
import { isTauri, invoke } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'
// Embed the font so exported SVGs render labels with the same metrics used for measurement
import interFont from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url&inline'
import { themeColors } from './store'

function groupColors(): Record<string, string> {
  const c = themeColors()
  return {
    'service-type': c.serviceTypeBg,
    instance: c.instanceBg,
    host: c.hostBg,
    address: c.addressBg,
  }
}

function groupFonts(): Record<string, { color: string; size: number }> {
  const c = themeColors()
  return {
    'service-type': { color: c.serviceTypeFont, size: 13 },
    instance: { color: c.instanceFont, size: 12 },
    host: { color: c.hostFont, size: 12 },
    address: { color: c.addressFont, size: 11 },
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [h, max === 0 ? 0 : d / max, max]
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r: number, g: number, b: number
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

function darken(hex: string): string {
  const [h, s, v] = rgbToHsv(
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  )
  const [r, g, b] = hsvToRgb(h, Math.min(1, s * 1.25), v * 0.8)
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

function nodeColors(n: Node): { background: string; border: string } {
  const c = n.color
  if (c && typeof c === 'object' && c.background)
    return { background: c.background, border: c.border ?? darken(c.background) }
  const bg = groupColors()[n.group ?? ''] ?? '#e0e0e0'
  return { background: bg, border: darken(bg) }
}

function nodeFontInfo(n: Node): { color: string; size: number } {
  const f = n.font
  if (f && typeof f === 'object') return { color: f.color ?? '#e0e0e0', size: f.size ?? 12 }
  return groupFonts()[n.group ?? ''] ?? { color: '#e0e0e0', size: 12 }
}

function shapeEl(n: Node, x: number, y: number): string {
  const r = n.size ?? 15
  const c = nodeColors(n)
  const fill = ` fill="${c.background}"`
  const stroke = ` stroke="${c.border}" stroke-width="${n.borderWidth ?? 2}"`
  const shadow = ' filter="url(#zux-shadow)"'
  switch (n.shape) {
    case 'diamond':
      return `<path d="M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z"${fill}${stroke}${shadow}/>`
    case 'square':
      return `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}"${fill}${stroke}${shadow}/>`
    case 'triangle':
      return `<path d="M ${x} ${y - r} L ${x + 1.15 * r} ${y + r} L ${x - 1.15 * r} ${y + r} Z"${fill}${stroke}${shadow}/>`
    default:
      return `<circle cx="${x}" cy="${y}" r="${r}"${fill}${stroke}${shadow}/>`
  }
}

const LABEL_GAP = 6

const ascentCache = new Map<number, number>()

function fontAscent(size: number): number {
  const cached = ascentCache.get(size)
  if (cached !== undefined) return cached
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.style.position = 'absolute'
  svg.style.width = '0'
  svg.style.height = '0'
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  t.setAttribute('font-family', "'Inter Variable', Arial, sans-serif")
  t.setAttribute('font-size', String(size))
  t.textContent = 'Ag'
  svg.appendChild(t)
  document.body.appendChild(svg)
  const ascent = -t.getBBox().y
  svg.remove()
  ascentCache.set(size, ascent)
  return ascent
}

function labelEl(n: Node, x: number, y: number): string {
  const f = nodeFontInfo(n)
  const yBaseline = y + (n.size ?? 15) + LABEL_GAP + fontAscent(f.size)
  return `<text x="${x}" y="${yBaseline}" text-anchor="middle" font-family="'Inter Variable', Arial, sans-serif" font-size="${f.size}" fill="${f.color}">${esc(n.label ?? '')}</text>`
}

interface VisBody {
  nodes?: Record<string, { id: IdType; group?: string; options?: Record<string, unknown> }>
  edges?: Record<
    string,
    {
      id: IdType
      fromId: IdType
      toId: IdType
      options?: Record<string, unknown>
      edgeType?: { getViaNode?(): Position }
    }
  >
}

type RawNode = Node & { id: IdType }
type RawEdge = Omit<Edge, 'dashes'> & {
  id: IdType
  from: IdType
  to: IdType
  dashes?: boolean | string
}

function extractNodeData(n: {
  id: IdType
  group?: string
  options?: Record<string, unknown>
}): RawNode {
  const o = n.options ?? {}
  return {
    id: n.id,
    group: (o.group as string | undefined) ?? n.group,
    hidden: o.hidden as boolean | undefined,
    shape: o.shape as string | undefined,
    color: o.color as Node['color'],
    size: o.size as number | undefined,
    borderWidth: o.borderWidth as number | undefined,
    label: o.label as string | undefined,
    font: o.font as Node['font'],
  }
}

function extractEdgeData(e: {
  id: IdType
  fromId: IdType
  toId: IdType
  options?: Record<string, unknown>
}): RawEdge {
  const o = e.options ?? {}
  let color: string | undefined
  if (typeof o.color === 'string') color = o.color
  else if (o.color && typeof o.color === 'object') color = (o.color as { color?: string }).color
  let dashes: boolean | string | undefined
  if (Array.isArray(o.dashes)) dashes = o.dashes.join(' ')
  else if (typeof o.dashes === 'boolean') dashes = o.dashes
  return {
    id: e.id,
    from: e.fromId,
    to: e.toId,
    dashes,
    color,
    width: o.width as number | undefined,
  }
}

export async function exportGraphSvg(network: Network) {
  const body = (network as unknown as { body?: VisBody }).body
  if (!body?.nodes || Object.keys(body.nodes).length === 0) return

  const pos: Record<string, Position | undefined> = network.getPositions()
  const posKeys = Object.keys(pos)
  if (posKeys.length === 0) return

  const visible = new Set<string>()
  for (const id of posKeys) {
    const raw = body.nodes?.[id]
    const hidden = raw?.options?.hidden
    if (hidden === true) continue
    visible.add(id)
  }
  if (visible.size === 0) return

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  for (const id of visible) {
    const p = pos[id]
    if (!p) continue
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }

  const pad = 60
  minX -= pad
  minY -= pad
  maxX += pad
  maxY += pad
  const w = Math.max(100, maxX - minX)
  const h = Math.max(100, maxY - minY)

  const edgeEls: string[] = []
  if (body.edges) {
    for (const rawEdge of Object.values(body.edges)) {
      if (!visible.has(String(rawEdge.fromId)) || !visible.has(String(rawEdge.toId))) continue
      const e = extractEdgeData(rawEdge)
      const pf = pos[e.from],
        pt = pos[e.to]
      if (!pf || !pt) continue
      const via = rawEdge.edgeType?.getViaNode?.()
      const d = via
        ? `M ${pf.x} ${pf.y} Q ${via.x} ${via.y} ${pt.x} ${pt.y}`
        : `M ${pf.x} ${pf.y} L ${pt.x} ${pt.y}`
      const dashes =
        typeof e.dashes === 'string'
          ? ` stroke-dasharray="${e.dashes}"`
          : e.dashes
            ? ' stroke-dasharray="5 5"'
            : ''
      const color = typeof e.color === 'string' ? e.color : '#78909c'
      edgeEls.push(
        `<path d="${d}" stroke="${color}" stroke-width="${e.width ?? 2}" fill="none"${dashes}/>`,
      )
    }
  }

  const nodeEls: string[] = []
  const labelEls: string[] = []
  for (const rawNode of Object.values(body.nodes)) {
    if (!visible.has(String(rawNode.id))) continue
    const p = pos[String(rawNode.id)]
    if (!p) continue
    const n = extractNodeData(rawNode)
    nodeEls.push(shapeEl(n, p.x, p.y))
    labelEls.push(labelEl(n, p.x, p.y))
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<rect width="${w}" height="${h}" fill="${themeColors().bgPrimary}"/>`,
    '<defs>',
    `<style>@font-face{font-family:'Inter Variable';src:url(${interFont}) format('woff2')}</style>`,
    '<filter id="zux-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/></filter>',
    '</defs>',
    `<g transform="translate(${-minX} ${-minY})">`,
    ...edgeEls,
    ...nodeEls,
    ...labelEls,
    '</g>',
    '</svg>',
  ].join('')

  const filename = `zux-graph-${new Date().toISOString().replace(/[:.]/g, '-')}.svg`
  if (isTauri()) {
    const path = await save({
      title: 'Export graph as SVG',
      defaultPath: filename,
      filters: [{ name: 'SVG', extensions: ['svg'] }],
    })
    if (!path) return
    await invoke('save_text_file', { path, contents: svg })
  } else {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
