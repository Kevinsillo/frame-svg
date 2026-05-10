import { resolveLayout } from '@/core/layout.ts'
import { ind } from '@/core/render-helpers.ts'
import { lookupPrimitive } from '@/core/registry.ts'
import type { RenderContext } from '@/core/primitive.ts'
import type {
  LayoutNode, ResolvedNode, ThemeVariables, FontConfig,
} from '@/core/types.ts'
import type { TemplateProps } from '@/components/primitives/template.ts'

export type { RenderContext } from '@/core/primitive.ts'

let _renderSeq = 0

// ─── Node renderer (dispatcher) ──────────────────────────────────────────────
// Looks up the primitive for `node.type` and delegates. No type-specific
// branches live here — every primitive owns its own render logic.

export function renderNode(node: ResolvedNode, ctx: RenderContext): string {
  return lookupPrimitive(node.type).render(node, ctx)
}

// ─── Style block generators ──────────────────────────────────────────────────

function themeStyleBlock(variables: ThemeVariables): string {
  const darkRules = Object.entries(variables).flatMap(([name, { dark }]) => [
    `.f-${name} { fill: ${dark}; }`,
    `.s-${name} { stroke: ${dark}; }`,
  ])
  const lightRules = Object.entries(variables).flatMap(([name, { light }]) => [
    `.f-${name} { fill: ${light}; }`,
    `.s-${name} { stroke: ${light}; }`,
  ])
  return [
    ...darkRules,
    '@media (prefers-color-scheme: light) {',
    ...lightRules.map(r => `  ${r}`),
    '}',
  ].join('\n')
}

function fontFaceBlock(font: FontConfig): string {
  if (!font._data) return ''
  const fmt = font._data.startsWith('data:') ? font._data : `data:font/woff2;base64,${font._data}`
  return [
    '@font-face {',
    `  font-family: '${font.family}';`,
    `  font-weight: ${font.weight ?? 400};`,
    `  font-style: ${font.style ?? 'normal'};`,
    `  src: url('${fmt}');`,
    '}',
  ].join('\n')
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function renderSvg(rootNode: LayoutNode): string {
  if (rootNode.type !== 'template') {
    throw new Error(
      `[frame-svg] renderSvg requires a Template root node. Got: "${rootNode.type}". ` +
      `Wrap your design in <Template theme={...}>.`
    )
  }
  const { variables, fonts, animation } = (rootNode.props as TemplateProps).theme ?? {}
  const resolved = resolveLayout(rootNode, 1e6)
  const w = resolved._width
  const h = resolved._height

  const ctx: RenderContext = { defs: [], animations: new Map(), id: 0, prefix: `fd${++_renderSeq}_`, variables, animation }
  const content = renderNode(resolved, ctx)

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px">`,
  ]

  // Style block
  const styleLines: string[] = []
  if (fonts?.length) styleLines.push(...fonts.map(fontFaceBlock).filter(Boolean))
  if (variables) styleLines.push(themeStyleBlock(variables))
  if (ctx.animations.size) styleLines.push([...ctx.animations.values()].join('\n'))
  if (styleLines.length) {
    parts.push(`  <style>\n${styleLines.map(s => s.split('\n').map(l => `    ${l}`).join('\n')).join('\n')}\n  </style>`)
  }

  // Defs block
  if (ctx.defs.length) {
    parts.push(`  <defs>\n${ctx.defs.map(d => `    ${d}`).join('\n')}\n  </defs>`)
  }

  parts.push(ind(content))
  parts.push(`</svg>`)
  return parts.join('\n')
}
