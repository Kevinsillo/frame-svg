import { describe, it, expect } from 'vitest'
import { parseSpacing, escapeXml } from '@/core/utils.ts'

// ─── parseSpacing ────────────────────────────────────────────────────────────

describe('parseSpacing', () => {
  it('returns [0,0,0,0] for null', () => {
    expect(parseSpacing(null)).toEqual([0, 0, 0, 0])
  })

  it('returns [0,0,0,0] for undefined', () => {
    expect(parseSpacing(undefined)).toEqual([0, 0, 0, 0])
  })

  it('expands a single number to 4 sides', () => {
    expect(parseSpacing(8)).toEqual([8, 8, 8, 8])
  })

  it('expands a single numeric string to 4 sides', () => {
    expect(parseSpacing('8')).toEqual([8, 8, 8, 8])
  })

  it('expands "8 16" to [top,right,bottom,left] (vertical,horizontal)', () => {
    expect(parseSpacing('8 16')).toEqual([8, 16, 8, 16])
  })

  it('expands "4 8 12" to [top,right,bottom,left] mirroring left from right', () => {
    expect(parseSpacing('4 8 12')).toEqual([4, 8, 12, 8])
  })

  it('parses full 4-tuple "4 8 12 16"', () => {
    expect(parseSpacing('4 8 12 16')).toEqual([4, 8, 12, 16])
  })

  it('falls back to 0 for unparseable strings (no throw)', () => {
    const result = parseSpacing('abc')
    expect(result).toHaveLength(4)
    expect(result).toEqual([0, 0, 0, 0])
  })

  it('keeps valid leading numbers and falls back to 0 for invalid tokens', () => {
    expect(parseSpacing('8 abc')).toEqual([8, 0, 8, 0])
  })

  it('treats empty string as zero spacing', () => {
    expect(parseSpacing('')).toEqual([0, 0, 0, 0])
  })
})

// ─── escapeXml ───────────────────────────────────────────────────────────────

describe('escapeXml', () => {
  it('escapes ampersand', () => {
    expect(escapeXml('a&b')).toBe('a&amp;b')
  })

  it('escapes less-than', () => {
    expect(escapeXml('a<b')).toBe('a&lt;b')
  })

  it('escapes greater-than', () => {
    expect(escapeXml('a>b')).toBe('a&gt;b')
  })

  it('escapes double-quote', () => {
    expect(escapeXml('say "hi"')).toBe('say &quot;hi&quot;')
  })

  it('leaves plain text unchanged', () => {
    expect(escapeXml('hello world')).toBe('hello world')
  })

  it('escapes a complex mixed string in correct order', () => {
    expect(escapeXml('<a href="x&y">')).toBe('&lt;a href=&quot;x&amp;y&quot;&gt;')
  })

  it('does not double-escape (already-escaped entity gets its & escaped too)', () => {
    expect(escapeXml('&amp;')).toBe('&amp;amp;')
  })
})
