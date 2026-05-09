import type { LayoutNode, TextProps } from '../core/types.ts'

export function Text(props: TextProps, content?: string): LayoutNode {
  const text = content ?? (props.content as string ?? '')
  return { type: 'text', props: { ...props, content: String(text).trim() }, children: [] }
}
