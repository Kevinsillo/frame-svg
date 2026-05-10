import { parseSpacing } from '@/core/utils.ts'
import {
  fillAttrs, strokeAttrs, addGradient, addShadow, applyAnimate, attrs,
  mergeClasses, isGradient, isToken,
} from '@/core/render-helpers.ts'
import { getMargin } from '@/core/layout-helpers.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type {
  LayoutNode, ResolvedNode, BorderProps, GradientBackground, Shadow, SpacingValue, Animate,
} from '@/core/types.ts'

// ─── Props ───────────────────────────────────────────────────────────────────

export interface CircleProps {
  size: number
  background?: string | GradientBackground
  border?: BorderProps | null
  opacity?: number
  shadow?: Shadow
  margin?: SpacingValue
  animate?: Animate
}

// ─── Factory (public API — unchanged) ────────────────────────────────────────

export function Circle({ animate, ...props }: CircleProps): LayoutNode {
  return { type: 'circle', props, animate, children: [] }
}

// ─── Primitive (self-contained render + layout) ──────────────────────────────

export const CirclePrimitive: Primitive = {
  render(node: ResolvedNode, ctx: RenderContext): string {
    const p = node.props as CircleProps
    const x = node._x
    const y = node._y
    const r = node._width / 2

    // Background
    const bgClass: string[] = []
    let bgFill: string | undefined
    if (isGradient(p.background)) {
      bgFill = `url(#${addGradient(p.background, ctx)})`
    } else {
      const { fill, class: cls } = fillAttrs(p.background, ctx)
      bgFill = fill
      if (cls) bgClass.push(cls)
    }

    // Border
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

    const circleAnim = applyAnimate(node.animate, ctx)
    const outerAttrs = [`transform="translate(${x}, ${y})"`, opacity != null ? `opacity="${opacity}"` : ''].filter(Boolean).join(' ')
    const circleEl = `<circle cx="${r}" cy="${r}" r="${r}" ${attrs({ fill: bgFill, class: circleClass, filter: shadowId ? `url(#${shadowId})` : undefined, ...strokeAttrsObj })}/>`

    const lines: string[] = []
    lines.push(`<g ${outerAttrs}>`)
    if (circleAnim) {
      lines.push(`  <g style="${circleAnim}">`)
      lines.push(`    ${circleEl}`)
      lines.push(`  </g>`)
    } else {
      lines.push(`  ${circleEl}`)
    }
    lines.push(`</g>`)
    return lines.join('\n')
  },

  resolveLayout(node: LayoutNode, _availableWidth: number): ResolvedNode {
    const p = node.props as CircleProps
    const [mt, mr, mb, ml] = parseSpacing(getMargin(node.props))
    const size = p.size
    return {
      ...node,
      _width: size, _height: size, _x: 0, _y: 0,
      _pt: 0, _pr: 0, _pb: 0, _pl: 0,
      _mt: mt, _mr: mr, _mb: mb, _ml: ml,
      children: [],
    }
  },

  measureIntrinsic(node: LayoutNode): number {
    return (node.props as CircleProps).size
  },
}
