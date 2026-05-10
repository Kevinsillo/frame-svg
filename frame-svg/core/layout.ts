import { lookupPrimitive } from '@/core/registry.ts'
import type { LayoutNode, ResolvedNode } from '@/core/types.ts'

// ─── Layout resolver (dispatcher) ────────────────────────────────────────────
// Looks up the primitive for `node.type` and delegates. Every primitive owns
// its own layout algorithm; this file holds none of that logic anymore.

export function resolveLayout(node: LayoutNode, availableWidth: number, forcedHeight?: number): ResolvedNode {
  return lookupPrimitive(node.type).resolveLayout(node, availableWidth, forcedHeight)
}
