import { parseSpacing } from '@/core/utils.ts'
import { strokeAttrs, attrs, applyAnimate } from '@/core/render-helpers.ts'
import { getMargin } from '@/core/layout-helpers.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type { LayoutNode, ResolvedNode, SpacingValue, Animate } from '@/core/types.ts'
import { ICONS, type IconName } from '@/components/primitives/icons/index.ts'

export type { IconName }

// ─── Props (colocated) ───────────────────────────────────────────────────────
// `name` and `paths` are mutually exclusive. If both are present, `name` wins.

export interface IconProps {
  name?: IconName
  paths?: string[]
  size?: number
  color?: string
  strokeWidth?: number
  viewBox?: number
  margin?: SpacingValue
  animate?: Animate
}

// ─── Factory (public API) ────────────────────────────────────────────────────

export function Icon({ animate, ...props }: IconProps): LayoutNode {
  return { type: 'icon', props, animate, children: [] }
}

// ─── Primitive (self-contained render + layout) ──────────────────────────────

export const IconPrimitive: Primitive = {
  render(node: ResolvedNode, ctx: RenderContext): string {
    const p = node.props as IconProps
    const x = node._x
    const y = node._y
    const size = node._width
    const vb = p.viewBox ?? 24
    const scale = size / vb
    const sw = (p.strokeWidth ?? 2) / scale
    const color = p.color ?? '$text'
    const { stroke, class: cls } = strokeAttrs(color, ctx)

    // Resolve paths: `name` takes precedence over `paths`.
    const resolvedPaths = p.name ? ICONS[p.name] : (p.paths ?? [])
    const pathEls = resolvedPaths.map(d => `<path d="${d}" fill="none"/>`)

    const iconAnim = applyAnimate(node.animate, ctx)
    const outerAttrs = `transform="translate(${x}, ${y})"`
    const innerAttrs = attrs({
      transform: `scale(${scale})`,
      stroke,
      class: cls,
      'stroke-width': +sw.toFixed(3),
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    })

    const lines: string[] = []
    lines.push(`<g ${outerAttrs}>`)
    if (iconAnim) {
      lines.push(`  <g style="${iconAnim}">`)
      lines.push(`    <g ${innerAttrs}>`)
      lines.push(...pathEls.map(el => `      ${el}`))
      lines.push(`    </g>`)
      lines.push(`  </g>`)
    } else {
      lines.push(`  <g ${innerAttrs}>`)
      lines.push(...pathEls.map(el => `    ${el}`))
      lines.push(`  </g>`)
    }
    lines.push(`</g>`)
    return lines.join('\n')
  },

  resolveLayout(node: LayoutNode, _availableWidth: number): ResolvedNode {
    const p = node.props as IconProps
    const [mt, mr, mb, ml] = parseSpacing(getMargin(node.props))
    const size = p.size ?? 20
    return {
      ...node,
      _width: size, _height: size, _x: 0, _y: 0,
      _pt: 0, _pr: 0, _pb: 0, _pl: 0,
      _mt: mt, _mr: mr, _mb: mb, _ml: ml,
      children: [],
    }
  },
}
