import { renderContainer } from '@/core/render-helpers.ts'
import { resolveContainerLayout } from '@/core/layout-helpers.ts'
import { resolveLayout } from '@/core/layout.ts'
import { renderNode } from '@/core/renderer.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type { LayoutNode, ResolvedNode, PageProps } from '@/core/types.ts'

// ─── Factory (public API — unchanged) ────────────────────────────────────────

export function Page(props: PageProps, ...children: LayoutNode[]): LayoutNode {
  return { type: 'page', props, children: children.flat(1) }
}

// ─── Primitive (self-contained render + layout) ──────────────────────────────
// Page is the document root. Width default (800 px) is applied by renderSvg
// before calling the dispatcher, so this primitive only resolves as declared.

export const PagePrimitive: Primitive = {
  render(node: ResolvedNode, ctx: RenderContext): string {
    return renderContainer(node, ctx, renderNode)
  },
  resolveLayout(node: LayoutNode, availableWidth: number): ResolvedNode {
    return resolveContainerLayout(node, availableWidth, resolveLayout)
  },
}
