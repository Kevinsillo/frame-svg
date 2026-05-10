import type { LayoutNode, NodeType, NodeProps, Animate } from '@/core/types.ts'

type JsxChild = LayoutNode | LayoutNode[] | string | null | undefined | boolean | number

// ─── JSX factory ─────────────────────────────────────────────────────────────
// Maps <Component prop={val}> to a LayoutNode tree.
// Configure via /** @jsx h */ or esbuild.jsxFactory in vite.config.ts.
//
// `animate` is a universal prop intercepted here and hoisted to the LayoutNode
// level — no primitive or compound needs to declare or handle it explicitly.

export function h(
  type: string | ((...args: any[]) => LayoutNode),
  props: Record<string, unknown> | null,
  ...rawChildren: JsxChild[]
): LayoutNode {
  const flat = rawChildren.flat(Infinity) as JsxChild[]
  const strings = flat.filter((c): c is string => typeof c === 'string')
  const nodes = flat.filter((c): c is LayoutNode =>
    c != null && c !== false && typeof c === 'object' && !Array.isArray(c)
  )
  const { animate, ...p } = props ?? {}

  // Function component (Card, compound, etc.)
  // If there are string children, inject them as `content` so JSX Text works:
  //   <Text fontSize={28}>Hello</Text>  →  Text({ fontSize: 28, content: 'Hello' })
  if (typeof type === 'function') {
    const merged = strings.length > 0 ? { ...p, content: strings.join('') } : p
    const node = type(merged, ...nodes)
    if (animate !== undefined) node.animate = animate as Animate
    return node
  }

  // Text node — either explicit type="text" or has string children
  if (type === 'text' || strings.length > 0) {
    const content = strings.join('') || (p.content as string ?? '')
    return { type: 'text' as NodeType, props: { ...p, content } as NodeProps, animate: animate as Animate, children: [] }
  }

  return { type: type as NodeType, props: p as NodeProps, animate: animate as Animate, children: nodes }
}
