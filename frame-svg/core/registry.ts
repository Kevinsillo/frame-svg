import type { Primitive } from '@/core/primitive.ts'
import type { NodeType } from '@/core/types.ts'

import { SpacerPrimitive } from '@/components/primitives/spacer.ts'
import { CirclePrimitive } from '@/components/primitives/circle.ts'
import { LinePrimitive } from '@/components/primitives/line.ts'
import { IconPrimitive } from '@/components/primitives/icon.ts'
import { TextPrimitive } from '@/components/primitives/text.ts'
import { BoxPrimitive } from '@/components/primitives/box.ts'
import { StackPrimitive } from '@/components/primitives/stack.ts'
import { GridPrimitive } from '@/components/primitives/grid.ts'
import { PagePrimitive } from '@/components/primitives/page.ts'

// ─── Primitive registry ──────────────────────────────────────────────────────
// Single source of truth mapping `NodeType` → `Primitive` implementation.
// The renderer and layout dispatchers consult this map and delegate; they
// own no per-type logic of their own.

export const REGISTRY: Record<NodeType, Primitive> = {
  page:   PagePrimitive,
  stack:  StackPrimitive,
  box:    BoxPrimitive,
  text:   TextPrimitive,
  circle: CirclePrimitive,
  line:   LinePrimitive,
  grid:   GridPrimitive,
  spacer: SpacerPrimitive,
  icon:   IconPrimitive,
}

export function lookupPrimitive(type: string): Primitive {
  const p = (REGISTRY as Record<string, Primitive | undefined>)[type]
  if (!p) {
    throw new Error(`[frame-svg] Unknown node type "${type}". No primitive registered.`)
  }
  return p
}
