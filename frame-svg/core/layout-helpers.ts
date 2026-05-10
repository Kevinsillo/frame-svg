import { parseSpacing, measureTextWidth } from '@/core/utils.ts'
import type {
  LayoutNode, ResolvedNode, NodeProps,
  TextProps, BoxProps, StackProps,
  CircleProps, LineProps, SpacerProps,
  SpacingValue,
} from '@/core/types.ts'

// ─── Width / height resolvers ────────────────────────────────────────────────

export function resolveWidth(propWidth: number | string | undefined, availableWidth: number): number {
  if (!propWidth || propWidth === '100%' || propWidth === 'auto' || propWidth === 'fit-content') return availableWidth
  if (typeof propWidth === 'string' && propWidth.endsWith('%')) {
    return availableWidth * parseFloat(propWidth) / 100
  }
  return Number(propWidth)
}

export function resolveHeight(heightProp: number | string | undefined, fallback: number): number {
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

// ─── Prop accessors (typed reads from a generic NodeProps) ───────────────────

export function getWidth(props: NodeProps): number | string | undefined {
  return (props as BoxProps).width
}

export function getMargin(props: NodeProps): SpacingValue | undefined {
  return (props as BoxProps).margin
}

export function getPadding(props: NodeProps): SpacingValue | undefined {
  return (props as BoxProps).padding
}

export function getAlign(props: NodeProps): string {
  return (props as StackProps).align ?? 'stretch'
}

// ─── Intrinsic (fit-content) width ───────────────────────────────────────────

// Returns intrinsic _width (excluding outer margin) for fit-content sizing.
export function measureIntrinsicWidth(node: LayoutNode): number {
  const props = node.props
  const [, pr, , pl] = parseSpacing(getPadding(props))

  if (node.type === 'text') {
    const p = props as TextProps
    const fontSize = Number(p.fontSize) || 16
    const [, tpr, , tpl] = parseSpacing(p.padding)
    return measureTextWidth(p.content ?? '', fontSize, p.fontFamily, p.fontWeight) + tpl + tpr
  }
  if (node.type === 'circle') return (props as CircleProps).size
  if (node.type === 'spacer') {
    const p = props as SpacerProps
    return Number(p.width ?? p.size ?? 0)
  }

  // Box / Stack: if an explicit numeric width is declared, honour it directly
  const explicitW = getWidth(props)
  if (typeof explicitW === 'number') return explicitW

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

// ─── Horizontal children resolver ────────────────────────────────────────────
// Walks horizontally-laid-out children, distributing leftover width across
// `auto`-sized siblings after subtracting fixed widths, gaps and margins.
// `resolveChild` is injected so this helper does not depend on `layout.ts`
// (avoids a circular import).

export function resolveHorizontalChildren(
  children: LayoutNode[],
  innerWidth: number,
  gap: number,
  resolveChild: (node: LayoutNode, availableWidth: number) => ResolvedNode,
): ResolvedNode[] {
  const totalGaps = gap * Math.max(0, children.length - 1)

  // Pre-compute per-child info so margins are included in space accounting
  const childInfo = children.map(c => {
    const [, cmr, , cml] = parseSpacing(getMargin(c.props))
    // Circles, spacers and lines have intrinsic size but may lack a width prop — treat as fixed
    if (c.type === 'circle') {
      return { isAuto: false, fixedWidth: (c.props as CircleProps).size, cml, cmr }
    }
    if (c.type === 'spacer') {
      const p = c.props as SpacerProps
      const fixedWidth = Number(p.width ?? p.size ?? 0)
      return { isAuto: false, fixedWidth, cml, cmr }
    }
    if (c.type === 'line') {
      const p = c.props as LineProps
      const isH = (p.direction ?? 'horizontal') === 'horizontal'
      const fixedWidth = isH ? Number(p.length ?? 0) : (p.thickness ?? 1)
      return { isAuto: false, fixedWidth, cml, cmr }
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
    return resolveChild(c, isAuto ? autoWidth : fixedWidth)
  })
}

// ─── Container layout (shared by Box, Stack, Page) ───────────────────────────
// `resolveChild` is injected to avoid a circular import with `layout.ts`.

export function resolveContainerLayout(
  node: LayoutNode,
  availableWidth: number,
  resolveChild: (node: LayoutNode, availableWidth: number) => ResolvedNode,
): ResolvedNode {
  const props = node.props
  const [mt, mr, mb, ml] = parseSpacing(getMargin(props))
  const width = resolveWidth(getWidth(props), availableWidth)
  const [pt, pr, pb, pl] = parseSpacing(getPadding(props))
  const innerWidth = Math.max(0, width - pl - pr)

  const sp = props as StackProps
  const direction = sp.direction ?? 'vertical'
  const gap = Number(sp.gap) || 0
  const align = getAlign(props)

  const resolvedChildren = direction === 'horizontal'
    ? resolveHorizontalChildren(node.children, innerWidth, gap, resolveChild)
    : node.children.map(c => resolveChild(c, innerWidth))

  const maxCrossHeight = direction === 'horizontal'
    ? resolvedChildren.reduce((m, c) => Math.max(m, c._mt + c._height + c._mb), 0)
    : 0

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
