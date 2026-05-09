import type { LayoutNode, SpacerProps } from '../core/types.ts'

export function Spacer(props: SpacerProps): LayoutNode {
  return { type: 'spacer', props, children: [] }
}
