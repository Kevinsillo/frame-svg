import { resolveWidth } from '@/core/layout-helpers.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type { LayoutNode, ResolvedNode } from '@/core/types.ts'

// ─── Props ───────────────────────────────────────────────────────────────────

export interface SpacerProps {
  size?: number
  width?: number | string
  height?: number
}

// ─── Factory (public API — unchanged) ────────────────────────────────────────

export function Spacer(props: SpacerProps): LayoutNode {
  return { type: 'spacer', props, children: [] }
}

// ─── Primitive (self-contained render + layout) ──────────────────────────────

export const SpacerPrimitive: Primitive = {
  render(node: ResolvedNode, _ctx: RenderContext): string {
    return `<g transform="translate(${node._x}, ${node._y})"/>`
  },

  resolveLayout(node: LayoutNode, availableWidth: number): ResolvedNode {
    const p = node.props as SpacerProps
    const width = resolveWidth(p.width ?? p.size, availableWidth)
    const height = p.height ?? p.size ?? 0
    return {
      ...node,
      _width: width, _height: height, _x: 0, _y: 0,
      _pt: 0, _pr: 0, _pb: 0, _pl: 0,
      _mt: 0, _mr: 0, _mb: 0, _ml: 0,
      children: [],
    }
  },

  measureIntrinsic(node: LayoutNode): number {
    const p = node.props as SpacerProps
    return Number(p.width ?? p.size ?? 0)
  },
}
