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

// Returns the ratio [0..1] if the value is a percentage/full, or null if content-based.
// 'full' is treated as -1 (fill remaining), numeric percentages as their ratio.
function parseRatio(h: string | number | undefined): number | 'full' | null {
  if (h === 'full') return 'full'
  if (typeof h === 'string' && h.endsWith('%')) {
    const r = parseFloat(h) / 100
    return isNaN(r) ? null : r
  }
  return null
}

function resolveFlowLayout(
  node: LayoutNode,
  props: ContainerProps,
  width: number,
  innerWidth: number,
  pt: number, pr: number, pb: number, pl: number,
  mt: number, mr: number, mb: number, ml: number,
  forcedHeight?: number,
): ResolvedNode {
  const direction = props.direction ?? 'vertical'
  const gap = Number(props.gap) || 0
  const align = props.align ?? 'stretch'
  const heightPropRaw = props.height

  let resolvedChildren: ReturnType<typeof resolveLayout>[]

  if (direction === 'horizontal') {
    resolvedChildren = resolveHorizontalChildren(node.children, innerWidth, gap, resolveLayout)
  } else {
    // Vertical: resolve percentage/full children only when parent height is known.
    const knownHeight = forcedHeight ?? (typeof heightPropRaw === 'number' ? heightPropRaw : undefined)
    if (knownHeight !== undefined) {
      const innerHeight = knownHeight - pt - pb
      const ratios = node.children.map(c => parseRatio((c.props as ContainerProps).height))
      const firstPass = node.children.map((c, i) => ratios[i] === null ? resolveLayout(c, innerWidth) : null)
      const fixedH = firstPass.reduce((s, c) => c ? s + c._mt + c._height + c._mb : s, 0)
      const totalGaps = gap * Math.max(0, node.children.length - 1)
      // Fixed-ratio children (e.g. "50%") are resolved against innerHeight.
      const fixedRatioH = ratios.reduce<number>((s, r) => (r !== null && r !== 'full') ? s + innerHeight * (r as number) : s, 0)
      // "full" children split the remaining space equally.
      const fullCount = ratios.filter(r => r === 'full').length
      const remainingH = Math.max(0, innerHeight - fixedH - (fixedRatioH as number) - totalGaps)
      const perFullH = fullCount > 0 ? remainingH / fullCount : 0
      resolvedChildren = node.children.map((c, i) => {
        const r = ratios[i]
        if (r === null)   return firstPass[i]!
        if (r === 'full') return resolveLayout(c, innerWidth, perFullH)
        return resolveLayout(c, innerWidth, innerHeight * r)
      })
    } else {
      resolvedChildren = node.children.map(c => resolveLayout(c, innerWidth))
    }
  }

  const maxCrossHeight = direction === 'horizontal'
    ? resolvedChildren.reduce((m, c) => Math.max(m, c._mt + c._height + c._mb), 0)
    : 0

  // Horizontal: re-resolve children that declare a cross-axis size.
  // • align='stretch'  → all children fill the full cross-axis
  // • any align        → children with height='X%'/'full', or vertical Line with length='X%'/'full'
  const layoutChildren = direction === 'horizontal'
    ? resolvedChildren.map((child, i) => {
        const orig = node.children[i]
        const { _mt: cmt, _mb: cmb } = child
        const innerCrossH = maxCrossHeight - cmt - cmb  // available height for this child

        let forcedH: number | undefined
        if (align === 'stretch') {
          forcedH = innerCrossH
        } else {
          const hr = parseRatio((orig.props as ContainerProps).height)
          if (hr === 'full') forcedH = innerCrossH
          else if (hr !== null) forcedH = innerCrossH * hr

          // Vertical Line with length as ratio
          if (orig.type === 'line' && ((orig.props as { direction?: string }).direction ?? 'horizontal') === 'vertical') {
            const lr = parseRatio((orig.props as { length?: unknown }).length as string | undefined)
            if (lr === 'full') forcedH = innerCrossH
            else if (lr !== null) forcedH = innerCrossH * lr
          }
        }

        if (forcedH === undefined) return child
        const reresolved = resolveLayout(orig, child._width, forcedH)
        return { ...reresolved, _height: Math.max(reresolved._height, forcedH), _x: 0, _y: 0 }
      })
    : resolvedChildren

  const heightProp = props.height
  const justify = props.justify ?? 'start'
  let extraGap = 0
  if (
    justify === 'space-between' &&
    direction === 'vertical' &&
    heightProp !== undefined &&
    layoutChildren.length > 1
  ) {
    const totalChildH = layoutChildren.reduce((s, c) => s + c._mt + c._height + c._mb, 0)
    const totalGaps = gap * (layoutChildren.length - 1)
    const available = resolveHeight(heightProp, 0) - pt - pb
    extraGap = Math.max(0, available - totalChildH - totalGaps) / (layoutChildren.length - 1)
  }

  let cursorX = pl
  let cursorY = pt
  let contentHeight = 0

  const positioned = layoutChildren.map((child, i) => {
    const isLast = i === layoutChildren.length - 1
    const { _mt: cmt, _mr: cmr, _mb: cmb, _ml: cml } = child
    let cx: number, cy: number

    if (direction === 'horizontal') {
      if (align === 'center') {
        cy = pt + (maxCrossHeight - child._height) / 2
      } else if (align === 'end') {
        cy = pt + maxCrossHeight - child._height - cmb
      } else if (align === 'stretch') {
        cy = pt + cmt
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
  const finalHeight = forcedHeight !== undefined
    ? forcedHeight
    : (heightProp !== undefined ? resolveHeight(heightProp, contentBasedHeight) : contentBasedHeight)

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

  resolveLayout(node: LayoutNode, availableWidth: number, forcedHeight?: number): ResolvedNode {
    const props = node.props as ContainerProps
    const [mt, mr, mb, ml] = parseSpacing(getMargin(node.props))
    const width = resolveWidth(getWidth(node.props), availableWidth)
    const [pt, pr, pb, pl] = parseSpacing(getPadding(node.props))
    const innerWidth = Math.max(0, width - pl - pr)

    const direction = props.direction ?? 'vertical'
    if (direction === 'grid') {
      return resolveGridLayout(node, props, width, innerWidth, pt, pr, pb, pl, mt, mr, mb, ml)
    }
    return resolveFlowLayout(node, props, width, innerWidth, pt, pr, pb, pl, mt, mr, mb, ml, forcedHeight)
  },
}
