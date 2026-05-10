import { parseSpacing } from '@/core/utils.ts'
import { renderContainer } from '@/core/render-helpers.ts'
import {
  getMargin, getPadding, getWidth,
  resolveWidth, resolveHeight,
  resolveHorizontalChildren,
} from '@/core/layout-helpers.ts'
import { resolveLayout } from '@/core/layout.ts'
import { renderNode } from '@/core/renderer.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type {
  LayoutNode, ResolvedNode,
  BorderProps, GradientBackground, Shadow, SpacingValue,
} from '@/core/types.ts'

// ─── Props ───────────────────────────────────────────────────────────────────
// Container is the unified flow primitive: it absorbs Box (vertical default),
// Stack (direction='horizontal'), and Grid (direction='grid'). All props are
// optional; defaults: direction='vertical', align='stretch', justify='start'.

export interface ContainerProps {
  width?: number | string
  height?: number | string
  direction?: 'vertical' | 'horizontal' | 'grid'
  columns?: number
  gap?: number
  padding?: SpacingValue
  margin?: SpacingValue
  background?: string | GradientBackground
  radius?: number | string
  border?: BorderProps | null
  shadow?: Shadow
  opacity?: number
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'space-between'
  // Grid-specific gap overrides (only consulted when direction='grid').
  columnGap?: number
  rowGap?: number
}

// ─── Factory (public API) ────────────────────────────────────────────────────

export function Container(props: ContainerProps, ...children: LayoutNode[]): LayoutNode {
  return { type: 'container', props, children: children.flat(1) }
}

// ─── Internal grid layout ────────────────────────────────────────────────────
// Replicates the algorithm from grid.ts so Container is fully self-contained.

function resolveGridLayout(
  node: LayoutNode,
  props: ContainerProps,
  width: number,
  innerWidth: number,
  pt: number, pr: number, pb: number, pl: number,
  mt: number, mr: number, mb: number, ml: number,
): ResolvedNode {
  const columns = Math.max(1, props.columns ?? 1)
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

  const heightProp = props.height
  const contentBasedHeight = pt + contentHeight + pb
  const finalHeight = heightProp !== undefined
    ? resolveHeight(heightProp, contentBasedHeight)
    : contentBasedHeight

  return {
    ...node,
    _width: width, _height: finalHeight,
    _x: 0, _y: 0,
    _pt: pt, _pr: pr, _pb: pb, _pl: pl,
    _mt: mt, _mr: mr, _mb: mb, _ml: ml,
    children: positioned,
  }
}

// ─── Internal flow (vertical / horizontal) layout ────────────────────────────
// Self-contained flow algorithm. Lives here so Container owns its own layout
// rather than delegating to a shared helper.

function resolveFlowLayout(
  node: LayoutNode,
  props: ContainerProps,
  width: number,
  innerWidth: number,
  pt: number, pr: number, pb: number, pl: number,
  mt: number, mr: number, mb: number, ml: number,
): ResolvedNode {
  const direction = props.direction ?? 'vertical'
  const gap = Number(props.gap) || 0
  const align = props.align ?? 'stretch'

  const resolvedChildren = direction === 'horizontal'
    ? resolveHorizontalChildren(node.children, innerWidth, gap, resolveLayout)
    : node.children.map(c => resolveLayout(c, innerWidth))

  const maxCrossHeight = direction === 'horizontal'
    ? resolvedChildren.reduce((m, c) => Math.max(m, c._mt + c._height + c._mb), 0)
    : 0

  const heightProp = props.height
  const justify = props.justify ?? 'start'
  let extraGap = 0
  if (
    justify === 'space-between' &&
    direction === 'vertical' &&
    heightProp !== undefined &&
    resolvedChildren.length > 1
  ) {
    const totalChildH = resolvedChildren.reduce((s, c) => s + c._mt + c._height + c._mb, 0)
    const totalGaps = gap * (resolvedChildren.length - 1)
    const available = resolveHeight(heightProp, 0) - pt - pb
    extraGap = Math.max(0, available - totalChildH - totalGaps) / (resolvedChildren.length - 1)
  }

  let cursorX = pl
  let cursorY = pt
  let contentHeight = 0

  const positioned = resolvedChildren.map((child, i) => {
    const isLast = i === resolvedChildren.length - 1
    const { _mt: cmt, _mr: cmr, _mb: cmb, _ml: cml } = child
    let cx: number, cy: number

    if (direction === 'horizontal') {
      if (align === 'center') {
        cy = pt + (maxCrossHeight - child._height) / 2
      } else if (align === 'end') {
        cy = pt + maxCrossHeight - child._height - cmb
      } else {
        cy = pt + cmt
      }
      cx = cursorX + cml
      cursorX += cml + child._width + cmr + (isLast ? 0 : gap)
      contentHeight = Math.max(contentHeight, cmt + child._height + cmb)
    } else {
      if (align === 'center') {
        cx = pl + (innerWidth - child._width) / 2
      } else if (align === 'end') {
        cx = pl + innerWidth - child._width - cmr
      } else {
        cx = pl + cml
      }
      cy = cursorY + cmt
      cursorY += cmt + child._height + cmb + (isLast ? 0 : gap + extraGap)
      contentHeight = cursorY - pt
    }

    return { ...child, _x: cx, _y: cy }
  })

  const contentBasedHeight = pt + contentHeight + pb
  const finalHeight = heightProp !== undefined
    ? resolveHeight(heightProp, contentBasedHeight)
    : contentBasedHeight

  return {
    ...node,
    _width: width, _height: finalHeight,
    _x: 0, _y: 0,
    _pt: pt, _pr: pr, _pb: pb, _pl: pl,
    _mt: mt, _mr: mr, _mb: mb, _ml: ml,
    children: positioned,
  }
}

// ─── Primitive (self-contained render + layout) ──────────────────────────────

export const ContainerPrimitive: Primitive = {
  render(node: ResolvedNode, ctx: RenderContext): string {
    return renderContainer(node, ctx, renderNode)
  },

  resolveLayout(node: LayoutNode, availableWidth: number): ResolvedNode {
    const props = node.props as ContainerProps
    const [mt, mr, mb, ml] = parseSpacing(getMargin(node.props))
    const width = resolveWidth(getWidth(node.props), availableWidth)
    const [pt, pr, pb, pl] = parseSpacing(getPadding(node.props))
    const innerWidth = Math.max(0, width - pl - pr)

    const direction = props.direction ?? 'vertical'
    if (direction === 'grid') {
      return resolveGridLayout(node, props, width, innerWidth, pt, pr, pb, pl, mt, mr, mb, ml)
    }
    return resolveFlowLayout(node, props, width, innerWidth, pt, pr, pb, pl, mt, mr, mb, ml)
  },
}
