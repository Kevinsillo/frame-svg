export { renderSvg } from '@/core/renderer.ts'
export { resolveLayout } from '@/core/layout.ts'
export { parseSpacing, wrapText, measureTextWidth, escapeXml } from '@/core/utils.ts'
export type { Primitive, RenderContext } from '@/core/primitive.ts'
export type {
  LayoutNode, ResolvedNode, NodeType, NodeProps, RenderOptions,
  TextProps, ContainerProps, TemplateProps,
  CircleProps, LineProps, SpacerProps,
  BorderProps, Shadow, GradientBackground, LinearGradient, RadialGradient, GradientStop,
  ThemeVariables, FontConfig, SpacingValue,
} from '@/core/types.ts'
