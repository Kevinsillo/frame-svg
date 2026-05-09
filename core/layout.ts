import { parseSpacing, wrapText, measureTextWidth } from './utils.ts'
import type {
  LayoutNode, ResolvedNode, NodeProps,
  TextProps, BoxProps, StackProps, GridProps,
  CircleProps, ImageProps, LineProps, SpacerProps,
  SpacingValue,
} from './types.ts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveWidth(propWidth: number | string | undefined, availableWidth: number): number {
  if (!propWidth || propWidth === '100%' || propWidth === 'auto' || propWidth === 'fit-content') return availableWidth
  if (typeof propWidth === 'string' && propWidth.endsWith('%')) {
    return availableWidth * parseFloat(propWidth) / 100
  }
  return Number(propWidth)
}

function resolveHeight(heightProp: number | string | undefined, fallback: number): number {
  if (heightProp === undefined || heightProp === null) return fallback
  const value = Number(heightProp)
  if (isNaN(value)) {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn(`[frame-svg] height="${heightProp}" is not a valid number and was ignored. Only fixed numbers are supported for height.`)
    }
    return fallback
  }
  return value
}

function getWidth(props: NodeProps): number | string | undefined {
  return (props as BoxProps).width
}

function getMargin(props: NodeProps): SpacingValue | undefined {
  return (props as BoxProps).margin
}

function getPadding(props: NodeProps): SpacingValue | undefined {
  return (props as BoxProps).padding
}

function getAlign(props: NodeProps): string {
  return (props as StackProps).align ?? 'stretch'
}

// ─── Intrinsic (fit-content) width ───────────────────────────────────────────

// Returns intrinsic _width (excluding outer margin) for fit-content sizing.
function measureIntrinsicWidth(node: LayoutNode): number {
  const props = node.props
  const [, pr, , pl] = parseSpacing(getPadding(props))

  if (node.type === 'text') {
    const p = props as TextProps
    const fontSize = Number(p.fontSize) || 16
    const [, tpr, , tpl] = parseSpacing(p.padding)
    return measureTextWidth(p.content ?? '', fontSize, p.fontFamily) + tpl + tpr
  }
  if (node.type === 'circle') return (props as CircleProps).size
  if (node.type === 'image') return Number((props as ImageProps).width || 0)
  if (node.type === 'spacer') {
    const p = props as SpacerProps
    return Number(p.width ?? p.size ?? 0)
  }

  // Box / Stack: padding + children content (children contribute margin + width)
  const sp = props as StackProps
  const direction = sp.direction ?? 'vertical'
  const gap = Number(sp.gap) || 0
  const childSizes = node.children.map(c => {
    const [, cmr, , cml] = parseSpacing(getMargin(c.props))
    return cml + measureIntrinsicWidth(c) + cmr
  })

  let contentWidth: number
  if (direction === 'horizontal') {
    const totalGaps = gap * Math.max(0, childSizes.length - 1)
    contentWidth = childSizes.reduce((s, w) => s + w, 0) + totalGaps
  } else {
    contentWidth = childSizes.length > 0 ? Math.max(...childSizes) : 0
  }

  return pl + contentWidth + pr
}

// ─── Horizontal children ──────────────────────────────────────────────────────

function resolveHorizontalChildren(
  children: LayoutNode[],
  innerWidth: number,
  gap: number,
): ResolvedNode[] {
  const totalGaps = gap * Math.max(0, children.length - 1)

  // Pre-compute per-child info so margins are included in space accounting
  const childInfo = children.map(c => {
    const [, cmr, , cml] = parseSpacing(getMargin(c.props))
    // Circles have intrinsic size but no width prop — treat as fixed
    if (c.type === 'circle') {
      return { isAuto: false, fixedWidth: (c.props as CircleProps).size, cml, cmr }
    }
    const w = getWidth(c.props)
    const isAuto = !w || w === '100%' || w === 'auto'
    let fixedWidth = 0
    if (!isAuto) {
      if (w === 'fit-content') fixedWidth = measureIntrinsicWidth(c)
      else if (typeof w === 'string' && w.endsWith('%')) fixedWidth = innerWidth * parseFloat(w) / 100
      else fixedWidth = Number(w)
    }
    return { isAuto, fixedWidth, cml, cmr }
  })

  const totalMargins = childInfo.reduce((s, { cml, cmr }) => s + cml + cmr, 0)
  const fixedWidthTotal = childInfo.reduce((s, { isAuto, fixedWidth }) => isAuto ? s : s + fixedWidth, 0)
  const autoCount = childInfo.filter(({ isAuto }) => isAuto).length

  const remaining = Math.max(0, innerWidth - totalGaps - totalMargins - fixedWidthTotal)
  const autoWidth = autoCount > 0 ? remaining / autoCount : 0

  return children.map((c, i) => {
    const { isAuto, fixedWidth } = childInfo[i]
    return resolveLayout(c, isAuto ? autoWidth : fixedWidth)
  })
}

// ─── Main layout resolver ─────────────────────────────────────────────────────

export function resolveLayout(node: LayoutNode, availableWidth: number): ResolvedNode {
  const props = node.props
  const [mt, mr, mb, ml] = parseSpacing(getMargin(props))

  // ── Leaf nodes ──

  if (node.type === 'text') {
    const p = props as TextProps
    const [pt, pr, pb, pl] = parseSpacing(p.padding)
    const width = resolveWidth(undefined, availableWidth)  // text always fills available width
    const innerWidth = Math.max(0, width - pl - pr)
    const fontSize = Number(p.fontSize) || 16
    const lineHeight = Number(p.lineHeight) || Math.round(fontSize * 1.4)
    const lines = wrapText(p.content, innerWidth, fontSize, p.fontFamily)
    const height = lines.length * lineHeight + pt + pb
    return {
      ...node, _width: width, _height: height, _x: 0, _y: 0,
      _pt: pt, _pr: pr, _pb: pb, _pl: pl,
      _mt: mt, _mr: mr, _mb: mb, _ml: ml,
      _lines: lines, _fontSize: fontSize, _lineHeight: lineHeight,
      children: [],
    }
  }

  if (node.type === 'circle') {
    const p = props as CircleProps
    const size = p.size
    return {
      ...node, _width: size, _height: size, _x: 0, _y: 0,
      _pt: 0, _pr: 0, _pb: 0, _pl: 0,
      _mt: mt, _mr: mr, _mb: mb, _ml: ml,
      children: [],
    }
  }

  if (node.type === 'image') {
    const p = props as ImageProps
    const width = resolveWidth(p.width, availableWidth)
    const height = Number(p.height) || width
    return {
      ...node, _width: width, _height: height, _x: 0, _y: 0,
      _pt: 0, _pr: 0, _pb: 0, _pl: 0,
      _mt: mt, _mr: mr, _mb: mb, _ml: ml,
      children: [],
    }
  }

  if (node.type === 'line') {
    const p = props as LineProps
    const isH = (p.direction ?? 'horizontal') === 'horizontal'
    const thickness = p.thickness ?? 1
    const width = isH ? resolveWidth(p.length ?? '100%', availableWidth) : thickness
    const height = isH ? thickness : (Number(p.length) || 0)
    return {
      ...node, _width: width, _height: height, _x: 0, _y: 0,
      _pt: 0, _pr: 0, _pb: 0, _pl: 0,
      _mt: mt, _mr: mr, _mb: mb, _ml: ml,
      children: [],
    }
  }

  if (node.type === 'spacer') {
    const p = props as SpacerProps
    const width = resolveWidth(p.width ?? p.size, availableWidth)
    const height = p.height ?? p.size ?? 0
    return {
      ...node, _width: width, _height: height, _x: 0, _y: 0,
      _pt: 0, _pr: 0, _pb: 0, _pl: 0,
      _mt: 0, _mr: 0, _mb: 0, _ml: 0,
      children: [],
    }
  }

  // ── Container nodes (page, box, stack, grid) ──

  const width = resolveWidth(getWidth(props), availableWidth)
  const [pt, pr, pb, pl] = parseSpacing(getPadding(props))
  const innerWidth = Math.max(0, width - pl - pr)

  // Grid layout
  if (node.type === 'grid') {
    return resolveGrid(node, props as GridProps, width, innerWidth, pt, pr, pb, pl, mt, mr, mb, ml)
  }

  // Stack / Box / Page layout
  const sp = props as StackProps
  const direction = sp.direction ?? 'vertical'
  const gap = Number(sp.gap) || 0
  const align = getAlign(props)

  const resolvedChildren = direction === 'horizontal'
    ? resolveHorizontalChildren(node.children, innerWidth, gap)
    : node.children.map(c => resolveLayout(c, innerWidth))

  // Compute max cross-axis height (for horizontal align)
  const maxCrossHeight = direction === 'horizontal'
    ? resolvedChildren.reduce((m, c) => Math.max(m, c._mt + c._height + c._mb), 0)
    : 0

  // Space-between distribution
  const heightProp = sp.height
  const justify = sp.justify ?? 'start'
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
      // Cross-axis alignment (vertical)
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
      // Cross-axis alignment (horizontal)
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

// ─── Grid layout ──────────────────────────────────────────────────────────────

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
      positioned.push({ ...child, _x: cx, _y: cy })
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
