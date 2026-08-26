import { readFile } from 'node:fs/promises'
import { test, expect } from '@playwright/test'

async function svgFromDownload(download) {
  const path = await download.path()
  return readFile(path, 'utf-8')
}

async function waitForGraph(page) {
  const links = page.locator('.legend-item.links-row .legend-count')
  await expect.poll(() => links.textContent() ?? '', { timeout: 15000 }).toMatch(/[1-9]/)
  // canvas presence confirms the vis-network instance rendered positions
  await page.waitForSelector('.graph-area canvas')
}

async function exportSvg(page) {
  const downloadPromise = page.waitForEvent('download')
  await page.locator('.export-btn').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^zux-graph-.*\.svg$/)
  return svgFromDownload(download)
}

test('exports the visible graph as SVG and excludes hidden groups', async ({ page }) => {
  await page.goto('/')
  await waitForGraph(page)

  const svg = await exportSvg(page)

  expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
  expect(svg).toContain('viewBox')

  // visible seeded nodes render with their labels
  expect(svg).toContain('Frontend')
  expect(svg).toContain('MQTT Broker')
  expect(svg).toContain('pi-web')
  expect(svg).toContain('192.168.1.10')

  // expected shape elements and embedded assets
  expect(svg).toContain('<circle')
  expect(svg).toContain('<rect')
  expect(svg).toContain('@font-face')
  expect(svg).toContain('zux-shadow')
  // edges are the only elements rendered with fill="none"
  expect(svg).toContain('fill="none"')

  // the service-type group is hidden by default and must be excluded
  expect(svg).not.toContain('_http._tcp')
})

test('includes a group once its legend toggle is enabled', async ({ page }) => {
  await page.goto('/')
  await waitForGraph(page)

  // enable the hidden "Service Type" group via its legend checkbox
  await page
    .locator('.legend-item', { hasText: 'Service Type' })
    .locator('input[type=checkbox]')
    .check()

  const svg = await exportSvg(page)

  // type nodes and their dashed type->instance edges are now present
  expect(svg).toContain('_http._tcp')
  expect(svg).toContain('stroke-dasharray="5 5"')
})
