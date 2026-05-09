import type { LayoutNode, StackProps } from '@/core/types.ts'

export function Stack(props: StackProps, ...children: LayoutNode[]): LayoutNode {
  return { type: 'stack', props, children: children.flat(1) }
}
