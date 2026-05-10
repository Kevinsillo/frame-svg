import { escapeXml } from '@/core/utils.ts'
import type { RenderContext } from '@/core/primitive.ts'
import type {
  ResolvedNode,
  Animate, AnimateProp, AnimationKeyframes, AnimationPreset,
  GradientBackground, LinearGradient, RadialGradient, Shadow,
  BorderProps,
} from '@/core/types.ts'

// Local structural view of a container's visual style props. Kept private to
// this module so renderContainer stays primitive-agnostic — it only knows the
// shape it consumes (background, radius, border, shadow, opacity).
type ContainerStyleProps = {
  background?: string | GradientBackground
  radius?: number | string
  border?: BorderProps | null
  opacity?: number
  shadow?: Shadow
}

// ─── Id allocation ───────────────────────────────────────────────────────────

export function nextId(ctx: RenderContext): string {
  return `${ctx.prefix}${++ctx.id}`
}

// ─── Theme tokens ────────────────────────────────────────────────────────────
// Strings prefixed with `$` resolve to CSS classes (.f-{name} / .s-{name}).
// Plain colors are emitted inline as fill/stroke attributes.

export function isToken(value: string): boolean {
  return value.startsWith('$')
}

export function tokenName(value: string): string {
  return value.slice(1)
}

export function fillAttrs(color: string | undefined, ctx: RenderContext): { fill?: string; class?: string } {
  if (!color) return {}
  if (isToken(color)) {
    if (!ctx.variables) return {}
    return { class: `f-${tokenName(color)}` }
  }
  return { fill: color }
}

export function strokeAttrs(color: string, ctx: RenderContext): { stroke?: string; class?: string } {
  if (isToken(color)) {
    if (!ctx.variables) return {}
    return { class: `s-${tokenName(color)}` }
  }
  return { stroke: color }
}

// ─── Animations ──────────────────────────────────────────────────────────────

export function buildKeyframesBlock(name: string, keyframes: AnimationKeyframes): string {
  const stops = Object.entries(keyframes).map(([stop, props]) => {
    const declarations = Object.entries(props).map(([k, v]) => `${k}: ${v};`).join(' ')
    return `  ${stop} { ${declarations} }`
  }).join('\n')
  return `@keyframes ${name} {\n${stops}\n}`
}

export function applyAnimate(animate: Animate | undefined, ctx: RenderContext): string | undefined {
  if (!animate) return undefined

  const prop: AnimateProp = typeof animate === 'string' ? { preset: animate } : animate
  const presets = ctx.animation?.presets
  const base: Partial<AnimationPreset> = (prop.preset && presets?.[prop.preset]) ? presets[prop.preset] : {}

  const keyframes = prop.keyframes ?? base.keyframes
  if (!keyframes) return undefined

  const duration  = prop.duration  ?? base.duration
  const easing    = prop.easing    ?? base.easing
  const delay     = prop.delay     ?? base.delay
  const iteration = prop.iteration ?? base.iteration
  const animName  = prop.preset ?? `a${nextId(ctx)}`

  if (!ctx.animations.has(animName)) {
    ctx.animations.set(animName, buildKeyframesBlock(animName, keyframes))
  }

  const parts: string[] = [animName]
  if (duration)         parts.push(duration)
  if (easing)           parts.push(easing)
  if (delay)            parts.push(delay)
  if (iteration != null) parts.push(String(iteration))
  return `animation:${parts.join(' ')};animation-fill-mode:both`
}

// ─── Gradients & Shadows ─────────────────────────────────────────────────────

export function isGradient(bg: unknown): bg is GradientBackground {
  return typeof bg === 'object' && bg !== null && 'stops' in bg
}

export function addGradient(bg: GradientBackground, ctx: RenderContext): string {
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

export function addShadow(shadow: Shadow, ctx: RenderContext): string {
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

// ─── SVG attribute / class builders ──────────────────────────────────────────

export function attrs(obj: Record<string, string | number | undefined>): string {
  return Object.entries(obj)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ')
}

export function mergeClasses(...classes: (string | undefined)[]): string | undefined {
  const merged = classes.filter(Boolean).join(' ')
  return merged || undefined
}

// ─── Indentation ─────────────────────────────────────────────────────────────

export function ind(str: string, n = 2): string {
  return str.split('\n').map(l => ' '.repeat(n) + l).join('\n')
}

// ─── Container renderer (page / box / stack) ─────────────────────────────────
// Generates the standard <g translate><rect bg/border/shadow><children></g>
// shape used by every container primitive. The recursive child rendering is
// delegated through `renderChild` so the dispatcher (renderer.ts) keeps owning
// the type→primitive lookup.

export function renderContainer(
  node: ResolvedNode,
  ctx: RenderContext,
  renderChild: (child: ResolvedNode, ctx: RenderContext) => string,
): string {
  const cp = node.props as ContainerStyleProps
  const x = node._x
  const y = node._y
  const w = node._width
  const h = node._height

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

  const containerAnim = applyAnimate(node.animate, ctx)
  const outerGroupAttrs = [`transform="translate(${x}, ${y})"`, opacity != null ? `opacity="${opacity}"` : ''].filter(Boolean).join(' ')
  const ni = containerAnim ? 4 : 2  // inner indent spaces

  const lines: string[] = []
  lines.push(`<g ${outerGroupAttrs}>`)
  if (containerAnim) lines.push(`  <g style="${containerAnim}">`)

  if (bgFill !== undefined || combinedClass || border || shadowId) {
    const rectA = attrs({
      width: w, height: h,
      fill: bgFill ?? (combinedClass ? undefined : 'none'),
      rx: radius || undefined,
      filter: shadowId ? `url(#${shadowId})` : undefined,
      class: combinedClass,
      ...strokeAttrsMap,
    })
    lines.push(`${' '.repeat(ni)}<rect ${rectA}/>`)
  }

  for (const child of node.children) {
    lines.push(ind(renderChild(child, ctx), ni))
  }

  if (containerAnim) lines.push(`  </g>`)
  lines.push(`</g>`)
  return lines.join('\n')
}

// `escapeXml` is re-exported so primitive files can pull XML helpers from a
// single module (render-helpers) without reaching into `utils`.
export { escapeXml }
