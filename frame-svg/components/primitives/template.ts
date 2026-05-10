import { resolveLayout } from '@/core/layout.ts'
import { renderNode } from '@/core/renderer.ts'
import type { Primitive, RenderContext } from '@/core/primitive.ts'
import type { LayoutNode, ResolvedNode, RenderOptions } from '@/core/types.ts'

// ─── Props ───────────────────────────────────────────────────────────────────
// Template is the mandatory document root. It carries RenderOptions (theme,
// fonts, animation tokens) and otherwise stays transparent in the layout —
// no width, padding, margin, background, etc. Those belong to the inner
// Container child that Template wraps.

export interface TemplateProps {
  theme: RenderOptions
}

// ─── Factory (public API) ────────────────────────────────────────────────────

export function Template(props: TemplateProps, child: LayoutNode): LayoutNode {
  return { type: 'template', props, children: [child] }
}

// ─── Primitive (transparent envelope) ────────────────────────────────────────
// Template's layout/render are pass-throughs:
//   - resolveLayout delegates to its single child with an effectively infinite
//     availableWidth (1e6) so the child determines its own size, then mirrors
//     the child's resolved width/height as Template's own. All padding/margin
//     are forced to zero.
//   - render emits no <g> wrapper — it just calls renderNode on the child and
//     returns the result, after seeding ctx.variables from theme.

export const TemplatePrimitive: Primitive = {
  render(node: ResolvedNode, ctx: RenderContext): string {
    if (node.children.length !== 1) {
      throw new Error('[frame-svg] Template must have exactly one child Container.')
    }
    const props = node.props as TemplateProps
    if (ctx.variables === undefined && props.theme?.variables) {
      ctx.variables = props.theme.variables
    }
    return renderNode(node.children[0]!, ctx)
  },

  resolveLayout(node: LayoutNode, _availableWidth: number): ResolvedNode {
    if (node.children.length !== 1) {
      throw new Error('[frame-svg] Template must have exactly one child Container.')
    }
    const child = resolveLayout(node.children[0]!, 1e6)
    return {
      ...node,
      children: [child],
      _width: child._width,
      _height: child._height,
      _x: 0, _y: 0,
      _pt: 0, _pr: 0, _pb: 0, _pl: 0,
      _mt: 0, _mr: 0, _mb: 0, _ml: 0,
    }
  },
}
