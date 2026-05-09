import type { LayoutNode, LineProps } from '../core/types.ts'

export function Line(props: LineProps = {}): LayoutNode {
  return { type: 'line', props, children: [] }
}
