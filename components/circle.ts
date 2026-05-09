import type { LayoutNode, CircleProps } from '../core/types.ts'

export function Circle(props: CircleProps): LayoutNode {
  return { type: 'circle', props, children: [] }
}
