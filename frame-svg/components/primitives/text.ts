import { parseSpacing, wrapText } from '@/core/utils.ts'
import {
  fillAttrs, applyAnimate, attrs, escapeXml,
} from '@/core/render-helpers.ts'
import { getMargin, resolveWidth } from '@/core/layout-helpers.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type { LayoutNode, ResolvedNode, TextProps } from '@/core/types.ts'

// ─── Factory (public API — unchanged, preserves size/weight aliases) ─────────

export function Text(props: TextProps & { size?: number; weight?: string | number }, content?: string): LayoutNode {
  const text = content ?? (props.content as string ?? '')
  const { size, weight, ...rest } = props
  const normalized: TextProps = {
    fontSize: rest.fontSize ?? size,
    fontWeight: rest.fontWeight ?? weight,
    ...rest,
    content: String(text).trim(),
  }
  return { type: 'text', props: normalized, children: [] }
}

// ─── Primitive (self-contained render + layout) ──────────────────────────────

export const TextPrimitive: Primitive = {
  render(node: ResolvedNode, ctx: RenderContext): string {
    const p = node.props as TextProps
    const x = node._x
    const y = node._y
    const w = node._width

    const fontSize = node._fontSize!
    const lineHeight = node._lineHeight!
    const fontWeight = p.fontWeight ?? 'normal'
    const fontFamily = p.fontFamily ?? 'system-ui, sans-serif'
    const textAlign = p.textAlign ?? 'left'
    const pl = node._pl, pt = node._pt

    const { fill, class: cls } = fillAttrs(p.color ?? '$text', ctx)
    const anchor = textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start'
    const tspanX = textAlign === 'center' ? w / 2 : textAlign === 'right' ? w - node._pr : pl

    const tspans = (node._lines ?? []).map((line, i) =>
      `<tspan x="${tspanX}" dy="${i === 0 ? pt + fontSize : lineHeight}">${escapeXml(line)}</tspan>`
    ).join('')

    const textAnim = applyAnimate(node.animate, ctx)
    const textEl = `<text ${attrs({ 'font-size': fontSize, 'font-weight': fontWeight, 'font-family': fontFamily, 'text-anchor': anchor, fill, class: cls })}>${tspans}</text>`

    const lines: string[] = []
    lines.push(`<g transform="translate(${x}, ${y})">`)
    if (textAnim) {
      lines.push(`  <g style="${textAnim}">`)
      lines.push(`    ${textEl}`)
      lines.push(`  </g>`)
    } else {
      lines.push(`  ${textEl}`)
    }
    lines.push(`</g>`)
    return lines.join('\n')
  },

  resolveLayout(node: LayoutNode, availableWidth: number): ResolvedNode {
    const p = node.props as TextProps
    const [mt, mr, mb, ml] = parseSpacing(getMargin(node.props))
    const [pt, pr, pb, pl] = parseSpacing(p.padding)
    const width = resolveWidth(undefined, availableWidth)  // text always fills available width
    const innerWidth = Math.max(0, width - pl - pr)
    const fontSize = Number(p.fontSize) || 16
    const lineHeight = Number(p.lineHeight) || Math.round(fontSize * 1.4)
    const lines = wrapText(p.content, innerWidth, fontSize, p.fontFamily, p.fontWeight)
    const height = lines.length * lineHeight + pt + pb
    return {
      ...node,
      _width: width, _height: height, _x: 0, _y: 0,
      _pt: pt, _pr: pr, _pb: pb, _pl: pl,
      _mt: mt, _mr: mr, _mb: mb, _ml: ml,
      _lines: lines, _fontSize: fontSize, _lineHeight: lineHeight,
      children: [],
    }
  },
}
