import { parseSpacing } from '@/core/utils.ts'
import { renderContainer } from '@/core/render-helpers.ts'
import { getMargin, getPadding, getWidth, resolveWidth } from '@/core/layout-helpers.ts'
import { resolveLayout } from '@/core/layout.ts'
import { renderNode } from '@/core/renderer.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type { LayoutNode, ResolvedNode, GridProps } from '@/core/types.ts'

// ─── Factory (public API — unchanged) ────────────────────────────────────────

export function Grid(props: GridProps, ...children: LayoutNode[]): LayoutNode {
  return { type: 'grid', props, children: children.flat(1) }
}

// ─── Internal grid layout ────────────────────────────────────────────────────
// Lives in this file — moved out of `core/layout-helpers.ts` (Phase 3) so the
// grid algorithm is now part of the grid primitive, not shared infrastructure.

function resolveGrid(
  node: LayoutNode,
  props: GridProps,
  width: number,
  innerWidth: number,
  pt: number, pr: number, pb: number, pl: number,
  mt: number, mr: number, mb: number, ml: number,
): ResolvedNode {
  const columns = props.columns
  const colGap = props.columnGap ?? props.gap ?? 0
  const rowGap = props.rowGap ?? props.gap ?? 0
  const align = props.align ?? 'stretch'

  const colWidth = Math.max(0, (innerWidth - colGap * (columns - 1)) / columns)
  const resolvedChildren = node.children.map(c => resolveLayout(c, colWidth))

  let cursorY = pt
  let contentHeight = 0
  const positioned: ResolvedNode[] = []

  for (let rowStart = 0; rowStart < resolvedChildren.length; rowStart += columns) {
    const row = resolvedChildren.slice(rowStart, Math.min(rowStart + columns, resolvedChildren.length))
    const rowHeight = row.reduce((m, c) => Math.max(m, c._mt + c._height + c._mb), 0)
    const isLastRow = rowStart + columns >= resolvedChildren.length

    row.forEach((child, col) => {
      let cx: number
      if (align === 'center') {
        cx = pl + col * (colWidth + colGap) + (colWidth - child._width) / 2
      } else if (align === 'end') {
        cx = pl + col * (colWidth + colGap) + colWidth - child._width - child._mr
      } else {
        cx = pl + col * (colWidth + colGap) + child._ml
      }
      const cy = cursorY + child._mt
      const stretchedHeight = align === 'stretch'
        ? rowHeight - child._mt - child._mb
        : child._height
      positioned.push({ ...child, _x: cx, _y: cy, _height: stretchedHeight })
    })

    cursorY += rowHeight + (isLastRow ? 0 : rowGap)
    contentHeight = cursorY - pt
  }

  const height = pt + contentHeight + pb

  return {
    ...node,
    _width: width, _height: height,
    _x: 0, _y: 0,
    _pt: pt, _pr: pr, _pb: pb, _pl: pl,
    _mt: mt, _mr: mr, _mb: mb, _ml: ml,
    children: positioned,
  }
}

// ─── Primitive (self-contained render + layout) ──────────────────────────────

export const GridPrimitive: Primitive = {
  render(node: ResolvedNode, ctx: RenderContext): string {
    return renderContainer(node, ctx, renderNode)
  },

  resolveLayout(node: LayoutNode, availableWidth: number): ResolvedNode {
    const props = node.props
    const [mt, mr, mb, ml] = parseSpacing(getMargin(props))
    const width = resolveWidth(getWidth(props), availableWidth)
    const [pt, pr, pb, pl] = parseSpacing(getPadding(props))
    const innerWidth = Math.max(0, width - pl - pr)
    return resolveGrid(node, props as GridProps, width, innerWidth, pt, pr, pb, pl, mt, mr, mb, ml)
  },
}
