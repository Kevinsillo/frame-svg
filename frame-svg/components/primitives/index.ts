// ─── Factories (the user-facing JSX/builder API) ─────────────────────────────

export { Page } from '@/components/primitives/page.ts'
export { Stack } from '@/components/primitives/stack.ts'
export { Box } from '@/components/primitives/box.ts'
export { Text } from '@/components/primitives/text.ts'
export { Circle } from '@/components/primitives/circle.ts'
export { Line } from '@/components/primitives/line.ts'
export { Grid } from '@/components/primitives/grid.ts'
export { Spacer } from '@/components/primitives/spacer.ts'
// Note: the `Icon` factory is intentionally NOT re-exported here. The public
// `Icon` name belongs to the compound at `components/compounds/icon.ts`,
// which wraps this primitive with the named-icon registry. The primitive
// factory itself is still importable directly from
// `@/components/primitives/icon.ts`.

// ─── Primitive objects (consumed by the registry / advanced users) ───────────

export { PagePrimitive } from '@/components/primitives/page.ts'
export { StackPrimitive } from '@/components/primitives/stack.ts'
export { BoxPrimitive } from '@/components/primitives/box.ts'
export { TextPrimitive } from '@/components/primitives/text.ts'
export { CirclePrimitive } from '@/components/primitives/circle.ts'
export { LinePrimitive } from '@/components/primitives/line.ts'
export { GridPrimitive } from '@/components/primitives/grid.ts'
export { SpacerPrimitive } from '@/components/primitives/spacer.ts'
export { IconPrimitive } from '@/components/primitives/icon.ts'
