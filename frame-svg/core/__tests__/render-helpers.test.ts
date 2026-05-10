import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { attrs, addGradient } from '@/core/render-helpers.ts'
import type { RenderContext } from '@/core/primitive.ts'

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeCtx(): RenderContext {
  return {
    defs: [],
    animations: new Map<string, string>(),
    id: 0,
    prefix: 't',
  }
}

// ─── attrs() ─────────────────────────────────────────────────────────────────

describe('attrs', () => {
  it('emits a simple string attribute', () => {
    expect(attrs({ fill: 'red' })).toContain('fill="red"')
  })

  it('emits a numeric attribute', () => {
    expect(attrs({ width: 100 })).toContain('width="100"')
  })

  it('keeps zero values (does not treat 0 as falsy)', () => {
    expect(attrs({ x: 0 })).toContain('x="0"')
  })

  it('omits undefined values', () => {
    expect(attrs({ fill: undefined })).not.toContain('fill')
  })

  it('omits null values', () => {
    // attrs signature is string | number | undefined, cast via unknown for the null edge case
    expect(attrs({ fill: null as unknown as undefined })).not.toContain('fill')
  })

  it('omits empty-string values', () => {
    expect(attrs({ class: '' })).not.toContain('class')
  })

  it('escapes double-quote in string values', () => {
    const result = attrs({ title: 'say "hi"' })
    expect(result).toContain('&quot;')
    expect(result).not.toContain('say "hi"')
  })

  it('escapes ampersand in string values', () => {
    const result = attrs({ href: 'a&b' })
    expect(result).toContain('&amp;')
    // The raw ampersand surrounded by letters must NOT appear unescaped
    expect(result).not.toMatch(/a&b/)
  })

  it('does not coerce numbers through escapeXml (numbers pass unchanged)', () => {
    // Use a number that contains characters escapeXml would touch — there's no such case,
    // but the contract is: numbers are emitted as-is.
    expect(attrs({ width: 100 })).toBe('width="100"')
  })

  it('preserves insertion order for multiple attrs', () => {
    expect(attrs({ width: 100, height: 50, fill: 'blue' }))
      .toBe('width="100" height="50" fill="blue"')
  })

  it('returns empty string for empty object', () => {
    expect(attrs({})).toBe('')
  })
})

// ─── addGradient() ───────────────────────────────────────────────────────────

describe('addGradient', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('adds a linear gradient with 2 stops and returns a non-empty id', () => {
    const ctx = makeCtx()
    const id = addGradient({
      type: 'linear',
      angle: 0,
      stops: [
        { offset: 0, color: 'red' },
        { offset: 1, color: 'blue' },
      ],
    }, ctx)

    expect(id).toBeTruthy()
    expect(ctx.defs).toHaveLength(1)
    expect(ctx.defs[0]).toContain('<linearGradient')
    // Should contain exactly 2 <stop> tags
    expect(ctx.defs[0].match(/<stop /g)).toHaveLength(2)
  })

  it('adds a radial gradient with 3 stops', () => {
    const ctx = makeCtx()
    const id = addGradient({
      type: 'radial',
      stops: [
        { offset: 0, color: 'red' },
        { offset: 0.5, color: 'green' },
        { offset: 1, color: 'blue' },
      ],
    }, ctx)

    expect(id).toBeTruthy()
    expect(ctx.defs).toHaveLength(1)
    expect(ctx.defs[0]).toContain('<radialGradient')
    expect(ctx.defs[0].match(/<stop /g)).toHaveLength(3)
  })

  it('warns and does not modify defs when stops is empty', () => {
    const ctx = makeCtx()
    addGradient({ type: 'linear', stops: [] }, ctx)
    expect(warnSpy).toHaveBeenCalled()
    expect(ctx.defs).toHaveLength(0)
  })

  it('warns and does not modify defs when stops has only one entry', () => {
    const ctx = makeCtx()
    addGradient({ type: 'linear', stops: [{ offset: 0, color: 'red' }] }, ctx)
    expect(warnSpy).toHaveBeenCalled()
    expect(ctx.defs).toHaveLength(0)
  })
})
