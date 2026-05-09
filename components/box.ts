import type { LayoutNode, BoxProps } from '../core/types.ts'

export function Box(props: BoxProps, ...children: LayoutNode[]): LayoutNode {
  return { type: 'box', props, children: children.flat(1) }
}
