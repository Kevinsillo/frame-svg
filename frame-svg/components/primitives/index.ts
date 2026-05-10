// ─── Factories (the user-facing JSX/builder API) ─────────────────────────────

export { Text } from '@/components/primitives/text.ts'
export { Circle } from '@/components/primitives/circle.ts'
export { Line } from '@/components/primitives/line.ts'
export { Spacer } from '@/components/primitives/spacer.ts'
export { Icon } from '@/components/primitives/icon.ts'
export { Container } from '@/components/primitives/container.ts'
export { Template } from '@/components/primitives/template.ts'
export type { IconProps, IconName } from '@/components/primitives/icon.ts'
export type { ContainerProps } from '@/components/primitives/container.ts'
export type { TemplateProps } from '@/components/primitives/template.ts'

// ─── Primitive objects (consumed by the registry / advanced users) ───────────

export { TextPrimitive } from '@/components/primitives/text.ts'
export { CirclePrimitive } from '@/components/primitives/circle.ts'
export { LinePrimitive } from '@/components/primitives/line.ts'
export { SpacerPrimitive } from '@/components/primitives/spacer.ts'
export { IconPrimitive } from '@/components/primitives/icon.ts'
export { ContainerPrimitive } from '@/components/primitives/container.ts'
export { TemplatePrimitive } from '@/components/primitives/template.ts'
