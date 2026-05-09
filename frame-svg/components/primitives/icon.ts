import type { LayoutNode, IconProps } from '@/core/types.ts'

export function Icon(props: IconProps): LayoutNode {
  return { type: 'icon', props, children: [] }
}
