import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { renderSvg } from '../core/index.ts'
import type { LayoutNode, RenderOptions } from '../core/types.ts'

const srcDir = resolve('./src')
const distDir = resolve('./dist')

const files = (await readdir(srcDir)).filter(f => f.endsWith('.ts') || f.endsWith('.frame'))

if (files.length === 0) {
  console.log('No design files found in src/')
  process.exit(0)
}

await mkdir(distDir, { recursive: true })

let ok = 0
let fail = 0

for (const file of files) {
  try {
    const url = pathToFileURL(join(srcDir, file))
    const mod = await import(url.href) as { default?: LayoutNode; theme?: RenderOptions }

    if (!mod.default) {
      console.warn(`⚠  ${file}: no default export, skipping`)
      continue
    }

    const svg = renderSvg(mod.default, mod.theme ?? {})
    const outName = file.replace(/\.(ts|frame)$/, '.svg')
    await writeFile(join(distDir, outName), svg, 'utf-8')
    console.log(`✓  dist/${outName}`)
    ok++
  } catch (err) {
    console.error(`✗  ${file}: ${(err as Error).message}`)
    fail++
  }
}

console.log(`\n${ok} rendered${fail ? `, ${fail} failed` : ''}`)
