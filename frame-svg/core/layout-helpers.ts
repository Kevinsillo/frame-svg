import { parseSpacing, measureTextWidth } from '@/core/utils.ts'
import { lookupPrimitive } from '@/core/registry.ts'
import type {
  LayoutNode, ResolvedNode, NodeProps,
  TextProps, SpacingValue,
} from '@/core/types.ts'

// ─── Container-shape views ───────────────────────────────────────────────────
// Local (non-exported) structural type used for the prop accessors below.
// Avoids importing ContainerProps so this module stays primitive-agnostic —
// it only knows the shape it consumes.

type ContainerLikeProps = {
  width?: number | string
  margin?: SpacingValue
  padding?: SpacingValue
  align?: string
  direction?: string
  columns?: number
}

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
  return (props as ContainerLikeProps).width
}

export function getMargin(props: NodeProps): SpacingValue | undefined {
  return (props as ContainerLikeProps).margin
}

export function getPadding(props: NodeProps): SpacingValue | undefined {
  return (props as ContainerLikeProps).padding
}

export function getAlign(props: NodeProps): string {
  return (props as ContainerLikeProps).align ?? 'stretch'
}

export function getDirection(props: NodeProps): string {
  return (props as ContainerLikeProps).direction ?? 'vertical'
}

export function getColumns(props: NodeProps): number | undefined {
  return (props as ContainerLikeProps).columns
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

  // Leaf primitives expose their intrinsic size via the registry.
  const intrinsic = lookupPrimitive(node.type).measureIntrinsic?.(node)
  if (intrinsic !== undefined) return intrinsic

  // Container-like: if an explicit numeric width is declared, honour it directly
  const explicitW = getWidth(props)
  if (typeof explicitW === 'number') return explicitW

  // Container-like: padding + children content (children contribute margin + width)
  const direction = getDirection(props)
  const gap = Number((props as { gap?: number }).gap) || 0
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
    // Leaf primitives with an intrinsic size are treated as fixed-width.
    const intrinsic = lookupPrimitive(c.type).measureIntrinsic?.(c)
    if (intrinsic !== undefined) {
      return { isAuto: false, fixedWidth: intrinsic, cml, cmr }
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

