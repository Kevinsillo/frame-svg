import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { renderSvg } from '@/core/index.ts'
import { initCanvas } from '@/core/utils.ts'
import type { LayoutNode, PageProps, RenderOptions, ThemeVariables } from '@/core/types.ts'
import sharp from 'sharp'

type Format = 'webp' | 'png' | 'jpeg' | 'avif' | 'gif' | 'tiff' | 'heif'
type Theme  = 'dark' | 'light'

const FORMATS: Format[] = ['webp', 'png', 'jpeg', 'avif', 'gif', 'tiff', 'heif']
const THEMES:  Theme[]  = ['dark', 'light']

const fmt   = (process.argv[2] ?? 'webp').toLowerCase() as Format
const theme = (process.argv[3] ?? 'light').toLowerCase()  as Theme

if (!FORMATS.includes(fmt)) {
  console.error(`✗  Unknown format "${fmt}". Valid: ${FORMATS.join(', ')}`)
  process.exit(1)
}
if (!THEMES.includes(theme)) {
  console.error(`✗  Unknown theme "${theme}". Valid: ${THEMES.join(', ')}`)
  process.exit(1)
}

function flatThemeCss(variables: ThemeVariables, mode: Theme): string {
  return Object.entries(variables)
    .flatMap(([name, val]) => [
      `.f-${name} { fill: ${val[mode]} !important; }`,
      `.s-${name} { stroke: ${val[mode]} !important; }`,
    ])
    .join('\n')
}

function injectFlatTheme(svg: string, variables: ThemeVariables | undefined, mode: Theme): string {
  if (!variables) return svg
  const override = `<style>${flatThemeCss(variables, mode)}</style>`
  return svg.replace('</svg>', `  ${override}\n</svg>`)
}

const entry  = resolve('./src/main.frame')
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

  const svg = injectFlatTheme(
    renderSvg(mod.default, renderOptions),
    renderOptions.variables,
    theme,
  )

  await mkdir(distDir, { recursive: true })
  const outFile = resolve(distDir, `main.${fmt}`)
  const buffer = await (sharp(Buffer.from(svg, 'utf-8'))[fmt] as (o: object) => sharp.Sharp)({ quality: 90 }).toBuffer()
  await writeFile(outFile, buffer)
  console.log(`✓  dist/main.${fmt}  [theme: ${theme}]`)
} catch (err) {
  console.error(`✗  ${(err as Error).message}`)
  process.exit(1)
}
