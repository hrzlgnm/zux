import type { Network } from 'vis-network'
import { isTauri, invoke } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'

const GROUP_COLORS: Record<string, { background: string; border: string }> = {
  'service-type': { background: '#4fc3f7', border: '#0288d1' },
  instance: { background: '#81c784', border: '#388e3c' },
  host: { background: '#ffb74d', border: '#f57c00' },
  address: { background: '#ce93d8', border: '#7b1fa2' },
}

const GROUP_FONTS: Record<string, { color: string; size: number }> = {
  'service-type': { color: '#e1f5fe', size: 13 },
  instance: { color: '#e8f5e9', size: 12 },
  host: { color: '#fff3e0', size: 12 },
  address: { color: '#f3e5f5', size: 11 },
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function nodeColor(n: any): { background: string; border: string } {
  const c = n.color
  if (c && typeof c === 'object' && c.background) return { background: c.background, border: c.border ?? c.background }
  return GROUP_COLORS[n.group] ?? { background: '#e0e0e0', border: '#90a4ae' }
}

function nodeFontInfo(n: any): { color: string; size: number } {
  const f = n.font ?? GROUP_FONTS[n.group]
  return { color: f?.color ?? '#e0e0e0', size: f?.size ?? 12 }
}

function shapeEl(n: any, x: number, y: number): string {
  const r = n.size ?? 15
  const c = nodeColor(n)
  const stroke = ` stroke="${c.border}" stroke-width="${n.borderWidth ?? 2}" fill="${c.background}"`
  const shadow = ' filter="url(#zux-shadow)"'
  switch (n.shape) {
    case 'diamond':
      return `<path d="M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z"${stroke}${shadow}/>`
    case 'square':
      return `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}"${stroke}${shadow}/>`
    case 'triangle':
      return `<path d="M ${x} ${y - r} L ${x + 1.15 * r} ${y + r} L ${x - 1.15 * r} ${y + r} Z"${stroke}${shadow}/>`
    default:
      return `<circle cx="${x}" cy="${y}" r="${r}"${stroke}${shadow}/>`
  }
}

function labelEl(n: any, x: number, y: number): string {
  const f = nodeFontInfo(n)
  const yLabel = y + (n.size ?? 15) + f.size * 0.5
  return `<text x="${x}" y="${yLabel}" text-anchor="middle" dominant-baseline="hanging" font-family="Arial, sans-serif" font-size="${f.size}" fill="${f.color}">${esc(n.label)}</text>`
}

export async function exportGraphSvg(network: Network) {
  const body = (network as any).body
  const nodes = body?.data?.nodes?.get() as any[]
  if (!nodes || nodes.length === 0) return
  const edges = (body?.data?.edges?.get() as any[]) ?? []
  const pos = network.getPositions()

  const visible = new Set<string>()
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const n of nodes) {
    const p = pos[n.id]
    if (!p || n.hidden) continue
    visible.add(n.id)
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y)
  }
  if (visible.size === 0) return

  const pad = 60
  minX -= pad; minY -= pad; maxX += pad; maxY += pad
  const w = Math.max(100, maxX - minX)
  const h = Math.max(100, maxY - minY)

  const edgeEls: string[] = []
  for (const e of edges) {
    if (!visible.has(e.from) || !visible.has(e.to)) continue
    const pf = pos[e.from], pt = pos[e.to]
    if (!pf || !pt) continue
    const via = body?.edges?.[e.id]?.edgeType?.getViaNode?.()
    const d = via ? `M ${pf.x} ${pf.y} Q ${via.x} ${via.y} ${pt.x} ${pt.y}` : `M ${pf.x} ${pf.y} L ${pt.x} ${pt.y}`
    const dashes = e.dashes ? ' stroke-dasharray="5 5"' : ''
    edgeEls.push(`<path d="${d}" stroke="${e.color ?? '#78909c'}" stroke-width="${e.width ?? 2}" fill="none"${dashes}/>`)
  }

  const nodeEls: string[] = []
  const labelEls: string[] = []
  for (const n of nodes) {
    const p = pos[n.id]
    if (!p || !visible.has(n.id)) continue
    nodeEls.push(shapeEl(n, p.x, p.y))
    labelEls.push(labelEl(n, p.x, p.y))
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<rect width="${w}" height="${h}" fill="#1a1a2e"/>`,
    '<defs><filter id="zux-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/></filter></defs>',
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
