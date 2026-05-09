import type { SpacingValue } from './types.ts'

export function parseSpacing(value: SpacingValue | undefined | null): [number, number, number, number] {
  if (value == null) return [0, 0, 0, 0]
  if (typeof value === 'number') return [value, value, value, value]
  const parts = String(value).trim().split(/\s+/).map(Number)
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]]
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]]
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]]
  return [parts[0], parts[1], parts[2], parts[3]]
}

// ─── Text measurement ─────────────────────────────────────────────────────────
// In browser: uses canvas for accurate measurement.
// In Node: falls back to character-width table (much better than flat 0.55).

// Character width ratios relative to fontSize for system-ui/sans-serif
const CHAR_WIDTHS: Record<string, number> = {
  ' ': 0.28,
  '.': 0.28, ',': 0.28, ':': 0.28, ';': 0.28, '!': 0.30, '?': 0.50,
  "'": 0.22, '"': 0.36, '(': 0.33, ')': 0.33, '[': 0.33, ']': 0.33,
  '-': 0.35, '_': 0.44, '/': 0.36, '\\': 0.36, '@': 0.88,
  '0': 0.55, '1': 0.38, '2': 0.55, '3': 0.55, '4': 0.55,
  '5': 0.55, '6': 0.55, '7': 0.50, '8': 0.55, '9': 0.55,
  'a': 0.50, 'b': 0.55, 'c': 0.46, 'd': 0.55, 'e': 0.50,
  'f': 0.32, 'g': 0.55, 'h': 0.55, 'i': 0.25, 'j': 0.28,
  'k': 0.52, 'l': 0.25, 'm': 0.80, 'n': 0.55, 'o': 0.55,
  'p': 0.55, 'q': 0.55, 'r': 0.36, 's': 0.44, 't': 0.36,
  'u': 0.55, 'v': 0.50, 'w': 0.72, 'x': 0.50, 'y': 0.50, 'z': 0.45,
  'A': 0.65, 'B': 0.62, 'C': 0.64, 'D': 0.68, 'E': 0.57, 'F': 0.54,
  'G': 0.70, 'H': 0.70, 'I': 0.30, 'J': 0.46, 'K': 0.65, 'L': 0.54,
  'M': 0.82, 'N': 0.70, 'O': 0.72, 'P': 0.60, 'Q': 0.72, 'R': 0.65,
  'S': 0.57, 'T': 0.60, 'U': 0.68, 'V': 0.65, 'W': 0.88, 'X': 0.65,
  'Y': 0.63, 'Z': 0.62,
}
const DEFAULT_CHAR_WIDTH = 0.55

let _measureCanvas: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null = null

function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  if (!_measureCanvas) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    _measureCanvas = { canvas, ctx }
  }
  return _measureCanvas.ctx
}

export function measureTextWidth(text: string, fontSize: number, fontFamily = 'system-ui, sans-serif'): number {
  const ctx = getCanvasCtx()
  if (ctx) {
    ctx.font = `${fontSize}px ${fontFamily}`
    return ctx.measureText(text).width
  }
  // Node fallback: character-level approximation
  let width = 0
  for (const ch of text) width += (CHAR_WIDTHS[ch] ?? DEFAULT_CHAR_WIDTH) * fontSize
  return width
}

export function wrapText(
  text: string | undefined,
  maxWidth: number,
  fontSize: number,
  fontFamily?: string,
): string[] {
  if (!text || maxWidth <= 0) return ['']
  const words = String(text).trim().split(/\s+/)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (measureTextWidth(candidate, fontSize, fontFamily) > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

export function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
