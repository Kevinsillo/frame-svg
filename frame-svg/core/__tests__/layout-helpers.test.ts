import { describe, it, expect } from 'vitest'
import { resolveWidth, resolveHeight } from '@/core/layout-helpers.ts'

// ─── resolveWidth ────────────────────────────────────────────────────────────

describe('resolveWidth', () => {
  it('returns the explicit numeric width', () => {
    expect(resolveWidth(200, 800)).toBe(200)
  })

  it('falls back to availableWidth when undefined', () => {
    expect(resolveWidth(undefined, 800)).toBe(800)
  })

  it('treats "full" as fill available', () => {
    expect(resolveWidth('full', 800)).toBe(800)
  })

  it('treats "100%" as fill available', () => {
    expect(resolveWidth('100%', 800)).toBe(800)
  })

  it('treats "auto" as fill available', () => {
    expect(resolveWidth('auto', 800)).toBe(800)
  })

  it('treats "fit-content" as fill available (delegated upstream)', () => {
    expect(resolveWidth('fit-content', 800)).toBe(800)
  })

  it('resolves "50%" as half of available width', () => {
    expect(resolveWidth('50%', 800)).toBe(400)
  })

  it('resolves "25%" as a quarter of available width', () => {
    expect(resolveWidth('25%', 400)).toBe(100)
  })
})

// ─── resolveHeight ───────────────────────────────────────────────────────────

describe('resolveHeight', () => {
  it('falls back when undefined', () => {
    expect(resolveHeight(undefined, 300)).toBe(300)
  })

  it('falls back when null', () => {
    expect(resolveHeight(null as unknown as undefined, 300)).toBe(300)
  })

  it('returns the fallback for "full" (resolved upstream via forcedHeight)', () => {
    expect(resolveHeight('full', 300)).toBe(300)
  })

  it('honours an explicit number', () => {
    expect(resolveHeight(120, 300)).toBe(120)
  })

  it('coerces a numeric string', () => {
    expect(resolveHeight('120', 300)).toBe(120)
  })

  it('falls back without throwing on a non-numeric string', () => {
    expect(resolveHeight('abc', 300)).toBe(300)
  })
})
