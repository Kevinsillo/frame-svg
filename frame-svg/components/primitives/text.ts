import type { LayoutNode, TextProps } from '@/core/types.ts'

export function Text(props: TextProps & { size?: number; weight?: string | number }, content?: string): LayoutNode {
  const text = content ?? (props.content as string ?? '')
  const { size, weight, ...rest } = props
  const normalized: TextProps = {
    fontSize: rest.fontSize ?? size,
    fontWeight: rest.fontWeight ?? weight,
    ...rest,
    content: String(text).trim(),
  }
  return { type: 'text', props: normalized, children: [] }
}
