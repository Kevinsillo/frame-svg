import type { LayoutNode, PageProps } from '../core/types.ts'

export function Page(props: PageProps, ...children: LayoutNode[]): LayoutNode {
  return { type: 'page', props, children: children.flat(1) }
}
