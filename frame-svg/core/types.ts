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
  src: string           // relative path to font file (e.g. './assets/Inter.woff2')
  weight?: number | string
  style?: 'normal' | 'italic'
  /** @internal base64 data auto-populated from src at render time */
  _data?: string
}

// ─── Animation ───────────────────────────────────────────────────────────────

export type AnimationKeyframes = Record<string, Record<string, string | number>>

export interface AnimationPreset {
  keyframes: AnimationKeyframes
  duration?: string
  easing?: string
  delay?: string
  iteration?: string | number
}

export interface AnimationTokens {
  duration?: { fast?: string; base?: string; slow?: string }
  easing?: { default?: string; bounce?: string; linear?: string }
  presets?: Record<string, AnimationPreset>
}

export interface AnimateProp {
  preset?: string
  keyframes?: AnimationKeyframes
  duration?: string
  easing?: string
  delay?: string
  iteration?: string | number
}

export type Animate = string | AnimateProp

// ─── Theme ───────────────────────────────────────────────────────────────────
// Colors prefixed with $ in props resolve to CSS theme classes,
// enabling prefers-color-scheme support. Example: background: '$surface'

export type ThemeVariables = Record<string, { dark: string; light: string }>

export interface RenderOptions {
  variables?: ThemeVariables
  fonts?: FontConfig[]
  animation?: AnimationTokens
}

// ─── Node props ───────────────────────────────────────────────────────────────

// Props colocated with their primitives — re-exported for backward compatibility.
import type { TextProps } from '@/components/primitives/text.ts'
import type { CircleProps } from '@/components/primitives/circle.ts'
import type { LineProps } from '@/components/primitives/line.ts'
import type { SpacerProps } from '@/components/primitives/spacer.ts'
import type { IconProps } from '@/components/primitives/icon.ts'
import type { ContainerProps } from '@/components/primitives/container.ts'
import type { TemplateProps } from '@/components/primitives/template.ts'
export type { TextProps, CircleProps, LineProps, SpacerProps, IconProps, ContainerProps, TemplateProps }

export type NodeProps =
  | TextProps | CircleProps | LineProps | SpacerProps | IconProps
  | ContainerProps | TemplateProps

// ─── Layout tree ──────────────────────────────────────────────────────────────

export type NodeType =
  | 'text' | 'circle' | 'line' | 'spacer' | 'icon'
  | 'container' | 'template'

export interface LayoutNode {
  type: NodeType
  props: NodeProps
  animate?: Animate
  children: LayoutNode[]
}

export interface ResolvedNode {
  type: NodeType
  props: NodeProps
  animate?: Animate
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
