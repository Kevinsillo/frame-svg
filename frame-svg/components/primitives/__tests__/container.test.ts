import { describe, it, expect } from 'vitest'
import { Container, ContainerPrimitive } from '@/components/primitives/container.ts'
import { Spacer } from '@/components/primitives/spacer.ts'
import type { LayoutNode } from '@/core/types.ts'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolve(node: LayoutNode, available = 400, forced?: number) {
  return ContainerPrimitive.resolveLayout(node, available, forced)
}

// A spacer with an explicit fixed size — used as a deterministic child whose
// layout numbers (_width/_height) are fully predictable.
function FixedChild(width: number, height: number, extra: Record<string, unknown> = {}): LayoutNode {
  return Spacer({ width, height, ...extra })
}

// ─── Null / undefined child props guard (spec #76 – first requirement) ───────

describe('Container — null / undefined child props guard', () => {
  it('does not throw when a child has null props', () => {
    // Bypass the factory to construct a malformed but plausible node — exactly
    // the situation a buggy compound or external builder might produce.
    const childNullProps: LayoutNode = {
      type: 'spacer',
      props: null as unknown as object,
      children: [],
    } as unknown as LayoutNode

    const node = Container({ width: 200, direction: 'vertical' }, childNullProps)
    expect(() => resolve(node, 400)).not.toThrow()
  })

  it('does not throw when a child has undefined props', () => {
    const childUndefProps: LayoutNode = {
      type: 'spacer',
      props: undefined as unknown as object,
      children: [],
    } as unknown as LayoutNode

    const node = Container({ width: 200, direction: 'vertical' }, childUndefProps)
    expect(() => resolve(node, 400)).not.toThrow()
  })

  it('does not throw when the container itself has null props', () => {
    const node: LayoutNode = {
      type: 'container',
      props: null as unknown as object,
      children: [],
    } as unknown as LayoutNode

    expect(() => resolve(node, 400)).not.toThrow()
  })
})

// ─── Vertical layout (characterisation) ──────────────────────────────────────

describe('Container — vertical flow', () => {
  it('stacks children vertically with gap (default direction=vertical)', () => {
    const node = Container(
      { width: 200, gap: 8 },
      FixedChild(100, 40),
      FixedChild(100, 40),
    )
    const r = resolve(node, 400)
    const [c0, c1] = r.children
    // First child sits at the top padding (0) + its own _mt (0)
    expect(c0._y).toBe(0)
    // Second child is positioned at: c0._y + c0._height + gap = 0 + 40 + 8 = 48
    expect(c1._y).toBe(48)
  })

  it('respects vertical padding via top-edge offset', () => {
    const node = Container(
      { width: 200, padding: 16, gap: 8 },
      FixedChild(100, 40),
      FixedChild(100, 40),
    )
    const r = resolve(node, 400)
    const [c0, c1] = r.children
    expect(c0._y).toBe(16)              // pt
    expect(c1._y).toBe(16 + 40 + 8)     // pt + height0 + gap
  })

  it('horizontal padding reduces innerWidth (children laid out within it)', () => {
    const node = Container(
      { width: 400, padding: 16 },
      FixedChild(100, 40),
    )
    const r = resolve(node, 400)
    expect(r._width).toBe(400)
    expect(r._pl).toBe(16)
    expect(r._pr).toBe(16)
    // Container width=400, innerWidth = 400 - 32 = 368 — first child sits at pl
    expect(r.children[0]._x).toBe(16)
  })
})

// ─── Horizontal layout (characterisation) ────────────────────────────────────

describe('Container — horizontal flow', () => {
  it('lays children horizontally with gap', () => {
    const node = Container(
      { width: 400, direction: 'horizontal', gap: 8 },
      FixedChild(100, 40),
      FixedChild(100, 40),
    )
    const r = resolve(node, 400)
    const [c0, c1] = r.children
    expect(c0._x).toBe(0)
    expect(c1._x).toBe(0 + 100 + 8)
  })

  it('align="center" centers children on the cross axis', () => {
    const node = Container(
      { width: 400, height: 100, direction: 'horizontal', align: 'center' },
      FixedChild(50, 40),
    )
    const r = resolve(node, 400)
    // Cross-axis = max child height (40). center → cy = pt + (40 - 40)/2 = 0
    expect(r.children[0]._y).toBe(0)
  })

  it('align="end" pushes children to the bottom of the cross axis', () => {
    const node = Container(
      { width: 400, direction: 'horizontal', align: 'end' },
      FixedChild(50, 60),
      FixedChild(50, 30),
    )
    const r = resolve(node, 400)
    // maxCrossH = 60. Child0 (60) → _y = pt + 60 - 60 - mb(0) = 0
    // Child1 (30) → _y = pt + 60 - 30 - mb(0) = 30
    expect(r.children[0]._y).toBe(0)
    expect(r.children[1]._y).toBe(30)
  })

  it('align="stretch" sets each child._height to the cross-axis size', () => {
    const node = Container(
      { width: 400, direction: 'horizontal', align: 'stretch' },
      FixedChild(50, 30),
      FixedChild(50, 60),
    )
    const r = resolve(node, 400)
    const maxCross = 60
    expect(r.children[0]._height).toBe(maxCross)
    expect(r.children[1]._height).toBe(maxCross)
  })
})

// ─── Grid layout (characterisation) ──────────────────────────────────────────

describe('Container — grid', () => {
  it('lays children in rows of `columns`', () => {
    const node = Container(
      { width: 400, direction: 'grid', columns: 2, gap: 0 },
      FixedChild(0, 40),
      FixedChild(0, 40),
      FixedChild(0, 40),
      FixedChild(0, 40),
    )
    const r = resolve(node, 400)
    const ys = r.children.map(c => c._y)
    // Items 0 and 1 share the top row (_y=0), items 2 and 3 share the second row (_y=40)
    expect(ys[0]).toBe(0)
    expect(ys[1]).toBe(0)
    expect(ys[2]).toBe(40)
    expect(ys[3]).toBe(40)
  })

  it('each grid cell width = (innerW - colGap*(cols-1)) / cols', () => {
    const node = Container(
      { width: 400, direction: 'grid', columns: 2, gap: 0 },
      FixedChild(0, 40),
      FixedChild(0, 40),
    )
    const r = resolve(node, 400)
    // colWidth = (400 - 0) / 2 = 200 — Spacer with width=0 reports _width=0,
    // but it was *laid out against* a 200-wide column, so its position is correct.
    expect(r.children[0]._x).toBe(0)
    expect(r.children[1]._x).toBe(200)
  })
})

// ─── Justify space-between (vertical) ────────────────────────────────────────

describe('Container — justify="space-between"', () => {
  it('distributes extra space evenly between children (vertical)', () => {
    // height=400, 3 children of 80px tall, gap=0 → gaps available = 400 - 240 = 160
    // extraGap = 160 / (3 - 1) = 80
    const node = Container(
      { width: 200, height: 400, direction: 'vertical', gap: 0, justify: 'space-between' },
      FixedChild(50, 80),
      FixedChild(50, 80),
      FixedChild(50, 80),
    )
    const r = resolve(node, 400)
    const [c0, c1, c2] = r.children
    expect(c0._y).toBe(0)
    expect(c1._y).toBe(0 + 80 + 80)        // child0 + extraGap
    expect(c2._y).toBe(0 + 80 + 80 + 80 + 80) // child0 + extraGap + child1 + extraGap
  })
})

// ─── Margin on resolved node ─────────────────────────────────────────────────

describe('Container — margin propagates to resolved node', () => {
  it('parses "8 16" into _mt=8, _mr=16, _mb=8, _ml=16', () => {
    const node = Container({ width: 200, margin: '8 16' })
    const r = resolve(node, 400)
    expect(r._mt).toBe(8)
    expect(r._mr).toBe(16)
    expect(r._mb).toBe(8)
    expect(r._ml).toBe(16)
  })

  it('parses padding=16 into _pt=_pr=_pb=_pl=16', () => {
    const node = Container({ width: 200, padding: 16 })
    const r = resolve(node, 400)
    expect(r._pt).toBe(16)
    expect(r._pr).toBe(16)
    expect(r._pb).toBe(16)
    expect(r._pl).toBe(16)
  })
})
