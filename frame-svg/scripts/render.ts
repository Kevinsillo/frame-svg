import { renderSvg } from '@/core/index.ts'
import type { LayoutNode, PageProps, RenderOptions } from '@/core/types.ts'
import { initCanvas } from '@/core/utils.ts'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const entry = resolve('./src/main.frame')
const distDir = resolve('./dist')

try {
  const mod = await import(pathToFileURL(entry).href) as { default?: LayoutNode }

  if (!mod.default) {
    console.error('main.frame does not export a default layout')
    process.exit(1)
  }

  const renderOptions: RenderOptions = (mod.default.props as PageProps).theme ?? {}

  for (const font of renderOptions.fonts ?? []) {
    if (font.src) {
      const buf = await readFile(resolve(font.src))
      font._data = buf.toString('base64')
    }
  }
  await initCanvas(renderOptions.fonts)

  await mkdir(distDir, { recursive: true })
  await writeFile(resolve(distDir, 'main.svg'), renderSvg(mod.default, renderOptions), 'utf-8')
  console.log('✓  dist/main.svg')
} catch (err) {
  console.error(`✗  ${(err as Error).message}`)
  process.exit(1)
}
