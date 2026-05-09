import type { LayoutNode, GridProps } from '../core/types.ts'

export function Grid(props: GridProps, ...children: LayoutNode[]): LayoutNode {
  return { type: 'grid', props, children: children.flat(1) }
}
