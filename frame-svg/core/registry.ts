import type { Primitive } from '@/core/primitive.ts'
import type { NodeType } from '@/core/types.ts'

import { SpacerPrimitive } from '@/components/primitives/spacer.ts'
import { CirclePrimitive } from '@/components/primitives/circle.ts'
import { LinePrimitive } from '@/components/primitives/line.ts'
import { IconPrimitive } from '@/components/primitives/icon.ts'
import { TextPrimitive } from '@/components/primitives/text.ts'
import { ContainerPrimitive } from '@/components/primitives/container.ts'
import { TemplatePrimitive } from '@/components/primitives/template.ts'

// ─── Primitive registry ──────────────────────────────────────────────────────
// Single source of truth mapping `NodeType` → `Primitive` implementation.
// The renderer and layout dispatchers consult this map and delegate; they
// own no per-type logic of their own.

// Single source of truth mapping `NodeType` → `Primitive`. lookupPrimitive()
// throws on missing types so the runtime path stays explicit.
export const REGISTRY: Record<NodeType, Primitive> = {
  text:      TextPrimitive,
  circle:    CirclePrimitive,
  line:      LinePrimitive,
  spacer:    SpacerPrimitive,
  icon:      IconPrimitive,
  container: ContainerPrimitive,
  template:  TemplatePrimitive,
}

export function lookupPrimitive(type: string): Primitive {
  const p = (REGISTRY as Record<string, Primitive | undefined>)[type]
  if (!p) {
    throw new Error(`[frame-svg] Unknown node type "${type}". No primitive registered.`)
  }
  return p
}
