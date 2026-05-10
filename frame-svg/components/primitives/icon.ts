import { parseSpacing } from '@/core/utils.ts'
import { strokeAttrs, attrs } from '@/core/render-helpers.ts'
import { getMargin } from '@/core/layout-helpers.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type { LayoutNode, ResolvedNode, IconProps } from '@/core/types.ts'

// ─── Factory (public API — unchanged) ────────────────────────────────────────

export function Icon(props: IconProps): LayoutNode {
  return { type: 'icon', props, children: [] }
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

    const groupAtt = attrs({
      transform: `translate(${x}, ${y}) scale(${scale})`,
      stroke,
      class: cls,
      'stroke-width': +sw.toFixed(3),
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    })

    const pathEls = (p.paths ?? []).map(d => `<path d="${d}" fill="none"/>`)

    const lines: string[] = []
    lines.push(`<g ${groupAtt}>`)
    lines.push(...pathEls.map(el => `  ${el}`))
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
