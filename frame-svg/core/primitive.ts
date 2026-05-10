import type {
  LayoutNode, ResolvedNode, ThemeVariables, AnimationTokens,
} from '@/core/types.ts'

// ─── Render context ──────────────────────────────────────────────────────────
// Collects gradients, animations and ids during a render pass. One instance
// per renderSvg call — never persisted between calls. Helpers receive it as an
// argument; primitives never store state on `this`.

export interface RenderContext {
  defs: string[]
  animations: Map<string, string>  // name → @keyframes block (deduplicated)
  id: number
  prefix: string                    // unique per renderSvg call — avoids id collisions in inline HTML
  variables?: ThemeVariables
  animation?: AnimationTokens
}

// ─── Primitive interface ─────────────────────────────────────────────────────
// Every primitive (box, stack, text, circle, …) implements this contract:
//   - render: produces SVG markup for a *resolved* node
//   - resolveLayout: computes positions/sizes given the available width
//
// The dispatchers (renderer.ts and layout.ts) look up the primitive by
// node.type from the registry and delegate. No fallback / no duck-typing.

export interface Primitive {
  render(node: ResolvedNode, ctx: RenderContext): string
  resolveLayout(node: LayoutNode, availableWidth: number): ResolvedNode
}
