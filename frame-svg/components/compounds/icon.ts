import { Icon as IconNode } from '@/components/primitives/icon.ts'
import { ICONS, type IconName } from '@/components/primitives/icons.ts'
import type { LayoutNode, SpacingValue } from '@/core/types.ts'

export type { IconName }

export interface IconProps {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
  margin?: SpacingValue
}

export function Icon({
  name,
  size = 20,
  color = '$text',
  strokeWidth = 2,
  margin,
}: IconProps): LayoutNode {
  return IconNode({ paths: [...ICONS[name]], size, color, strokeWidth, margin })
}
