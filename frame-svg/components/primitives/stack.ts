import { renderContainer } from '@/core/render-helpers.ts'
import { resolveContainerLayout } from '@/core/layout-helpers.ts'
import { resolveLayout } from '@/core/layout.ts'
import { renderNode } from '@/core/renderer.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type { LayoutNode, ResolvedNode, StackProps } from '@/core/types.ts'

// ─── Factory (public API — unchanged) ────────────────────────────────────────

export function Stack(props: StackProps, ...children: LayoutNode[]): LayoutNode {
  return { type: 'stack', props, children: children.flat(1) }
}

// ─── Primitive (self-contained render + layout) ──────────────────────────────

export const StackPrimitive: Primitive = {
  render(node: ResolvedNode, ctx: RenderContext): string {
    return renderContainer(node, ctx, renderNode)
  },
  resolveLayout(node: LayoutNode, availableWidth: number): ResolvedNode {
    return resolveContainerLayout(node, availableWidth, resolveLayout)
  },
}
