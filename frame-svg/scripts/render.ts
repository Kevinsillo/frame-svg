import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { renderSvg } from '@/core/index.ts'
import type { LayoutNode, PageProps, RenderOptions } from '@/core/types.ts'

const entry = resolve('./src/main.frame')
const distDir = resolve('./dist')

try {
  const mod = await import(pathToFileURL(entry).href) as { default?: LayoutNode }

  if (!mod.default) {
    console.error('main.frame does not export a default layout')
    process.exit(1)
  }

  const renderOptions: RenderOptions = (mod.default.props as PageProps).theme ?? {}

  await mkdir(distDir, { recursive: true })
  await writeFile(resolve(distDir, 'main.svg'), renderSvg(mod.default, renderOptions), 'utf-8')
  console.log('✓  dist/main.svg')
} catch (err) {
  console.error(`✗  ${(err as Error).message}`)
  process.exit(1)
}
