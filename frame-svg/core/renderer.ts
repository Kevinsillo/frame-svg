import { resolveLayout } from '@/core/layout.ts'
import { escapeXml } from '@/core/utils.ts'
import type {
  LayoutNode, ResolvedNode, RenderOptions, Theme,
  TextProps, BoxProps, StackProps, CircleProps, ImageProps, LineProps, IconProps,
  LinearGradient, RadialGradient, GradientBackground, Shadow, BorderProps,
  FontConfig, PageProps,
} from '@/core/types.ts'

// ─── Render context (collects defs during render) ─────────────────────────────

interface RenderContext {
  defs: string[]
  id: number
  prefix: string  // unique per renderSvg call — avoids id collisions in inline HTML
  theme?: Theme
}

let _renderSeq = 0

function nextId(ctx: RenderContext): string {
  return `${ctx.prefix}${++ctx.id}`
}

// ─── Theme helpers ────────────────────────────────────────────────────────────

function isToken(value: string): boolean {
  return value.startsWith('$')
}

function tokenName(value: string): string {
  return value.slice(1)  // '$surface' → 'surface'
}

// Returns [fillAttr, classAttr] for a fill color (background or text color)
function fillAttrs(color: string | undefined, ctx: RenderContext): { fill?: string; class?: string } {
  if (!color) return {}
  if (isToken(color)) {
    if (!ctx.theme) return {}
    return { class: `f-${tokenName(color)}` }
  }
  return { fill: color }
}

function strokeAttrs(color: string, ctx: RenderContext): { stroke?: string; class?: string } {
  if (isToken(color)) {
    if (!ctx.theme) return {}
    return { class: `s-${tokenName(color)}` }
  }
  return { stroke: color }
}

// ─── Gradient helpers ─────────────────────────────────────────────────────────

function isGradient(bg: unknown): bg is GradientBackground {
  return typeof bg === 'object' && bg !== null && 'stops' in bg
}

function addGradient(bg: GradientBackground, ctx: RenderContext): string {
  const id = nextId(ctx)

  if (bg.type === 'linear') {
    const lg = bg as LinearGradient
    const angle = lg.angle ?? 0
    const rad = (angle - 90) * (Math.PI / 180)
    const x1 = (0.5 - 0.5 * Math.cos(rad)).toFixed(3)
    const y1 = (0.5 - 0.5 * Math.sin(rad)).toFixed(3)
    const x2 = (0.5 + 0.5 * Math.cos(rad)).toFixed(3)
    const y2 = (0.5 + 0.5 * Math.sin(rad)).toFixed(3)
    const stops = lg.stops.map(s =>
      `<stop offset="${(s.offset * 100).toFixed(0)}%" stop-color="${s.color}"/>`
    ).join('')
    ctx.defs.push(
      `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`
    )
  } else {
    const rg = bg as RadialGradient
    const cx = ((rg.cx ?? 0.5) * 100).toFixed(0)
    const cy = ((rg.cy ?? 0.5) * 100).toFixed(0)
    const stops = rg.stops.map(s =>
      `<stop offset="${(s.offset * 100).toFixed(0)}%" stop-color="${s.color}"/>`
    ).join('')
    ctx.defs.push(
      `<radialGradient id="${id}" cx="${cx}%" cy="${cy}%" r="50%">${stops}</radialGradient>`
    )
  }

  return id
}

function addShadow(shadow: Shadow, ctx: RenderContext): string {
  const id = nextId(ctx)
  const dx = shadow.x ?? 0
  const dy = shadow.y ?? 4
  const stdDev = shadow.blur ?? 8
  const color = shadow.color ?? 'rgba(0,0,0,0.3)'
  ctx.defs.push(
    `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${stdDev}" flood-color="${color}"/>` +
    `</filter>`
  )
  return id
}

function addClipRect(w: number, h: number, radius: number, ctx: RenderContext): string {
  const id = nextId(ctx)
  ctx.defs.push(
    `<clipPath id="${id}"><rect width="${w}" height="${h}" rx="${radius}"/></clipPath>`
  )
  return id
}

// ─── SVG attribute builder ────────────────────────────────────────────────────

function attrs(obj: Record<string, string | number | undefined>): string {
  return Object.entries(obj)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ')
}

function mergeClasses(...classes: (string | undefined)[]): string | undefined {
  const merged = classes.filter(Boolean).join(' ')
  return merged || undefined
}

// ─── Node renderer ────────────────────────────────────────────────────────────

function ind(str: string, n = 2): string {
  return str.split('\n').map(l => ' '.repeat(n) + l).join('\n')
}

function renderNode(node: ResolvedNode, ctx: RenderContext): string {
  const props = node.props
  const x = node._x
  const y = node._y
  const w = node._width
  const h = node._height
  const lines: string[] = []

  // ── Text ──────────────────────────────────────────────────────────────────
  if (node.type === 'text') {
    const p = props as TextProps
    const fontSize = node._fontSize!
    const lineHeight = node._lineHeight!
    const fontWeight = p.fontWeight ?? 'normal'
    const fontFamily = p.fontFamily ?? 'system-ui, sans-serif'
    const textAlign = p.textAlign ?? 'left'
    const pl = node._pl, pt = node._pt

    const { fill, class: cls } = fillAttrs(p.color ?? '#000000', ctx)
    const anchor = textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start'
    const tspanX = textAlign === 'center' ? w / 2 : textAlign === 'right' ? w - node._pr : pl

    const tspans = (node._lines ?? []).map((line, i) =>
      `<tspan x="${tspanX}" dy="${i === 0 ? pt + fontSize : lineHeight}">${escapeXml(line)}</tspan>`
    ).join('')

    lines.push(`<g transform="translate(${x}, ${y})">`)
    lines.push(`  <text ${attrs({ 'font-size': fontSize, 'font-weight': fontWeight, 'font-family': fontFamily, 'text-anchor': anchor, fill, class: cls })}>${tspans}</text>`)
    lines.push(`</g>`)
    return lines.join('\n')
  }

  // ── Circle ────────────────────────────────────────────────────────────────
  if (node.type === 'circle') {
    const p = props as CircleProps
    const r = w / 2
    const bgClass: string[] = []
    let bgFill: string | undefined

    if (isGradient(p.background)) {
      bgFill = `url(#${addGradient(p.background, ctx)})`
    } else {
      const { fill, class: cls } = fillAttrs(p.background, ctx)
      bgFill = fill
      if (cls) bgClass.push(cls)
    }

    const border = p.border as BorderProps | null | undefined
    let strokeCls: string | undefined
    const strokeAttrsObj: Record<string, string | number | undefined> = {}
    if (border) {
      if (isToken(border.color)) {
        const s = strokeAttrs(border.color, ctx)
        strokeCls = s.class
      } else {
        strokeAttrsObj.stroke = border.color
      }
      strokeAttrsObj['stroke-width'] = border.width
    }

    const shadowId = p.shadow ? addShadow(p.shadow, ctx) : undefined
    const circleClass = mergeClasses(...bgClass, strokeCls)
    const opacity = p.opacity != null ? p.opacity : undefined

    lines.push(`<g transform="translate(${x}, ${y})"${opacity != null ? ` opacity="${opacity}"` : ''}>`)
    lines.push(`  <circle cx="${r}" cy="${r}" r="${r}" ${attrs({ fill: bgFill, class: circleClass, filter: shadowId ? `url(#${shadowId})` : undefined, ...strokeAttrsObj })}/>`)
    lines.push(`</g>`)
    return lines.join('\n')
  }

  // ── Image ─────────────────────────────────────────────────────────────────
  if (node.type === 'image') {
    const p = props as ImageProps
    const radius = p.radius ?? 0
    const clipId = radius > 0 ? addClipRect(w, h, radius, ctx) : undefined
    const opacity = p.opacity != null ? p.opacity : undefined

    lines.push(`<g transform="translate(${x}, ${y})"${opacity != null ? ` opacity="${opacity}"` : ''}>`)
    lines.push(`  <image href="${p.src}" width="${w}" height="${h}"${clipId ? ` clip-path="url(#${clipId})"` : ''}/>`)
    lines.push(`</g>`)
    return lines.join('\n')
  }

  // ── Line ──────────────────────────────────────────────────────────────────
  if (node.type === 'line') {
    const p = props as LineProps
    const isH = (p.direction ?? 'horizontal') === 'horizontal'
    const color = p.color ?? '#94a3b8'
    const thickness = p.thickness ?? 1
    const { stroke, class: cls } = strokeAttrs(color, ctx)
    const x2 = isH ? w : 0
    const y2 = isH ? 0 : h

    lines.push(`<g transform="translate(${x}, ${y})">`)
    lines.push(`  <line x1="0" y1="0" x2="${x2}" y2="${y2}" ${attrs({ stroke, 'stroke-width': thickness, 'stroke-dasharray': p.dash, class: cls })}/>`)
    lines.push(`</g>`)
    return lines.join('\n')
  }

  // ── Spacer ────────────────────────────────────────────────────────────────
  if (node.type === 'spacer') {
    return `<g transform="translate(${x}, ${y})"/>`
  }

  // ── Icon ──────────────────────────────────────────────────────────────────
  if (node.type === 'icon') {
    const p = props as IconProps
    const size = node._width
    const vb = p.viewBox ?? 24
    const scale = size / vb
    const sw = (p.strokeWidth ?? 2) / scale
    const color = p.color ?? '$text'
    const { stroke, class: cls } = strokeAttrs(color, ctx)

    const groupAtt = attrs({
      transform: `translate(${x}, ${y}) scale(${scale})`,
      stroke,
      class: cls,
      'stroke-width': +sw.toFixed(3),
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    })

    const pathEls = (p.paths ?? []).map(d => `<path d="${d}" fill="none"/>`)

    lines.push(`<g ${groupAtt}>`)
    lines.push(...pathEls.map(el => `  ${el}`))
    lines.push(`</g>`)
    return lines.join('\n')
  }

  // ── Container (page, box, stack, grid) ───────────────────────────────────
  const cp = props as BoxProps & StackProps
  const background = cp.background
  const radius = Number(cp.radius ?? 0)
  const border = cp.border as BorderProps | null | undefined
  const opacity = cp.opacity != null ? Number(cp.opacity) : undefined
  const shadow = cp.shadow

  // Background
  let bgFill: string | undefined
  const bgClasses: string[] = []

  if (isGradient(background)) {
    bgFill = `url(#${addGradient(background, ctx)})`
  } else if (background) {
    const { fill, class: cls } = fillAttrs(background as string, ctx)
    bgFill = fill
    if (cls) bgClasses.push(cls)
  }

  // Border
  const strokeAttrsMap: Record<string, string | number | undefined> = {}
  if (border) {
    if (isToken(border.color)) {
      const s = strokeAttrs(border.color, ctx)
      if (s.class) bgClasses.push(s.class)
    } else {
      strokeAttrsMap.stroke = border.color
    }
    strokeAttrsMap['stroke-width'] = border.width
  }

  // Shadow filter
  const shadowId = shadow ? addShadow(shadow, ctx) : undefined
  const combinedClass = mergeClasses(...bgClasses)

  const groupAttrs = `transform="translate(${x}, ${y})"${opacity != null ? ` opacity="${opacity}"` : ''}`
  lines.push(`<g ${groupAttrs}>`)

  if (bgFill !== undefined || combinedClass || border || shadowId) {
    const rectA = attrs({
      width: w, height: h,
      fill: bgFill ?? (combinedClass ? undefined : 'none'),
      rx: radius || undefined,
      filter: shadowId ? `url(#${shadowId})` : undefined,
      class: combinedClass,
      ...strokeAttrsMap,
    })
    lines.push(`  <rect ${rectA}/>`)
  }

  for (const child of node.children) {
    lines.push(ind(renderNode(child, ctx)))
  }

  lines.push(`</g>`)
  return lines.join('\n')
}

// ─── Style block generators ───────────────────────────────────────────────────

function themeStyleBlock(theme: Theme): string {
  const { tokens } = theme
  const darkRules = Object.entries(tokens).flatMap(([name, { dark }]) => [
    `.f-${name} { fill: ${dark}; }`,
    `.s-${name} { stroke: ${dark}; }`,
  ])
  const lightRules = Object.entries(tokens).flatMap(([name, { light }]) => [
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
  const fmt = font.data.startsWith('data:') ? font.data : `data:font/woff2;base64,${font.data}`
  return [
    '@font-face {',
    `  font-family: '${font.family}';`,
    `  font-weight: ${font.weight ?? 400};`,
    `  font-style: ${font.style ?? 'normal'};`,
    `  src: url('${fmt}');`,
    '}',
  ].join('\n')
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function renderSvg(rootNode: LayoutNode, options: RenderOptions = {}): string {
  const { theme, fonts } = options
  const rootWidth = Number((rootNode.props as PageProps).width) || 800
  const resolved = resolveLayout(rootNode, rootWidth)
  const w = resolved._width
  const h = resolved._height

  const ctx: RenderContext = { defs: [], id: 0, prefix: `fd${++_renderSeq}_`, theme }
  const content = renderNode(resolved, ctx)

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px">`,
  ]

  // Style block
  const styleLines: string[] = []
  if (fonts?.length) styleLines.push(...fonts.map(fontFaceBlock))
  if (theme) styleLines.push(themeStyleBlock(theme))
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
