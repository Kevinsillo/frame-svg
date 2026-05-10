import { parseSpacing } from '@/core/utils.ts'
import { strokeAttrs, applyAnimate, attrs } from '@/core/render-helpers.ts'
import { getMargin, resolveWidth } from '@/core/layout-helpers.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type { LayoutNode, ResolvedNode, SpacingValue, Animate } from '@/core/types.ts'

// ─── Props ───────────────────────────────────────────────────────────────────

export interface LineProps {
  direction?: 'horizontal' | 'vertical'
  color?: string
  thickness?: number
  length?: number | string  // explicit length; defaults to 100% for horizontal, required for vertical
  dash?: string             // stroke-dasharray
  margin?: SpacingValue
  animate?: Animate
}

// ─── Factory (public API — unchanged) ────────────────────────────────────────

export function Line({ animate, ...props }: LineProps = {}): LayoutNode {
  return { type: 'line', props, animate, children: [] }
}

// ─── Primitive (self-contained render + layout) ──────────────────────────────

export const LinePrimitive: Primitive = {
  render(node: ResolvedNode, ctx: RenderContext): string {
    const p = node.props as LineProps
    const x = node._x
    const y = node._y
    const w = node._width
    const h = node._height

    const isH = (p.direction ?? 'horizontal') === 'horizontal'
    const color = p.color ?? '#94a3b8'
    const thickness = p.thickness ?? 1
    const { stroke, class: cls } = strokeAttrs(color, ctx)
    const x2 = isH ? w : 0
    const y2 = isH ? 0 : h

    const lineAnim = applyAnimate(node.animate, ctx)
    const lineEl = `<line x1="0" y1="0" x2="${x2}" y2="${y2}" ${attrs({ stroke, 'stroke-width': thickness, 'stroke-dasharray': p.dash, class: cls })}/>`

    const lines: string[] = []
    lines.push(`<g transform="translate(${x}, ${y})">`)
    if (lineAnim) {
      lines.push(`  <g style="${lineAnim}">`)
      lines.push(`    ${lineEl}`)
      lines.push(`  </g>`)
    } else {
      lines.push(`  ${lineEl}`)
    }
    lines.push(`</g>`)
    return lines.join('\n')
  },

  resolveLayout(node: LayoutNode, availableWidth: number, forcedHeight?: number): ResolvedNode {
    const p = node.props as LineProps
    const [mt, mr, mb, ml] = parseSpacing(getMargin(node.props))
    const isH = (p.direction ?? 'horizontal') === 'horizontal'
    const thickness = p.thickness ?? 1
    const width  = isH ? resolveWidth(p.length ?? '100%', availableWidth) : thickness
    const height = isH
      ? thickness
      : (p.length === 'full' && forcedHeight !== undefined)
        ? forcedHeight
        : resolveWidth(p.length ?? 0, availableWidth)
    return {
      ...node,
      _width: width, _height: height, _x: 0, _y: 0,
      _pt: 0, _pr: 0, _pb: 0, _pl: 0,
      _mt: mt, _mr: mr, _mb: mb, _ml: ml,
      children: [],
    }
  },

  measureIntrinsic(node: LayoutNode): number {
    const p = node.props as LineProps
    const isH = (p.direction ?? 'horizontal') === 'horizontal'
    return isH ? Number(p.length ?? 0) : (p.thickness ?? 1)
  },
}
