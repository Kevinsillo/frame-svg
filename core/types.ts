export type SpacingValue = number | string

// ─── Visual primitives ────────────────────────────────────────────────────────

export interface BorderProps {
  width: number
  color: string
}

export interface GradientStop {
  offset: number  // 0–1
  color: string
}

export interface LinearGradient {
  type: 'linear'
  angle?: number  // degrees, 0 = top→bottom, 90 = left→right
  stops: GradientStop[]
}

export interface RadialGradient {
  type: 'radial'
  cx?: number  // center x 0–1, default 0.5
  cy?: number  // center y 0–1, default 0.5
  stops: GradientStop[]
}

export type GradientBackground = LinearGradient | RadialGradient

export interface Shadow {
  x?: number
  y?: number
  blur?: number
  color?: string
}

export interface FontConfig {
  family: string
  weight?: number
  style?: 'normal' | 'italic'
  data: string  // base64-encoded woff/woff2
}

// ─── Theme ───────────────────────────────────────────────────────────────────
// Colors prefixed with $ in props resolve to CSS theme classes,
// enabling prefers-color-scheme support. Example: background: '$surface'

export interface ThemeTokens {
  [tokenName: string]: {
    dark: string
    light: string
  }
}

export interface Theme {
  tokens: ThemeTokens
}

export interface RenderOptions {
  theme?: Theme
  fonts?: FontConfig[]
}

// ─── Node props ───────────────────────────────────────────────────────────────

export interface PageProps {
  width?: number | string
  padding?: SpacingValue
  background?: string | GradientBackground
  theme?: RenderOptions
}

export interface StackProps {
  direction?: 'vertical' | 'horizontal'
  gap?: number
  padding?: SpacingValue
  margin?: SpacingValue
  background?: string | GradientBackground
  radius?: number
  border?: BorderProps | null
  width?: number | string
  height?: number  // percentage strings not supported — use a fixed number
  shadow?: Shadow
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'space-between'
}

export interface BoxProps {
  padding?: SpacingValue
  margin?: SpacingValue
  background?: string | GradientBackground
  radius?: number
  border?: BorderProps | null
  width?: number | string
  height?: number  // percentage strings not supported — use a fixed number
  opacity?: number
  shadow?: Shadow
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export interface TextProps {
  content?: string
  fontSize?: number
  fontWeight?: string | number
  fontFamily?: string
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
  padding?: SpacingValue
  margin?: SpacingValue
}

export interface CircleProps {
  size: number
  background?: string | GradientBackground
  border?: BorderProps | null
  opacity?: number
  shadow?: Shadow
  margin?: SpacingValue
}

export interface ImageProps {
  src: string
  width: number | string
  height: number | string
  radius?: number
  opacity?: number
  margin?: SpacingValue
}

export interface LineProps {
  direction?: 'horizontal' | 'vertical'
  color?: string
  thickness?: number
  length?: number | string  // explicit length; defaults to 100% for horizontal, required for vertical
  dash?: string             // stroke-dasharray
  margin?: SpacingValue
}

export interface GridProps {
  columns: number
  gap?: number
  columnGap?: number
  rowGap?: number
  padding?: SpacingValue
  margin?: SpacingValue
  background?: string | GradientBackground
  radius?: number
  border?: BorderProps | null
  width?: number | string
  shadow?: Shadow
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export interface SpacerProps {
  size?: number
  width?: number | string
  height?: number
}

export interface IconProps {
  paths: string[]
  size?: number
  color?: string
  strokeWidth?: number
  viewBox?: number
  margin?: SpacingValue
}

export type NodeProps =
  | PageProps | StackProps | BoxProps | TextProps
  | CircleProps | ImageProps | LineProps | GridProps | SpacerProps | IconProps

// ─── Layout tree ──────────────────────────────────────────────────────────────

export type NodeType = 'page' | 'stack' | 'box' | 'text' | 'circle' | 'image' | 'line' | 'grid' | 'spacer' | 'icon'

export interface LayoutNode {
  type: NodeType
  props: NodeProps
  children: LayoutNode[]
}

export interface ResolvedNode {
  type: NodeType
  props: NodeProps
  children: ResolvedNode[]
  _width: number
  _height: number
  _x: number
  _y: number
  _pt: number
  _pr: number
  _pb: number
  _pl: number
  _mt: number
  _mr: number
  _mb: number
  _ml: number
  // text only
  _lines?: string[]
  _fontSize?: number
  _lineHeight?: number
}
