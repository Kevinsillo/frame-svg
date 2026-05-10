import type { SpacingValue } from '@/core/types.ts'

export function parseSpacing(value: SpacingValue | undefined | null): [number, number, number, number] {
  if (value == null) return [0, 0, 0, 0]
  if (typeof value === 'number') return [value, value, value, value]
  const raw = String(value).trim()
  if (raw === '') return [0, 0, 0, 0]
  const tokens = raw.split(/\s+/)
  const parts = tokens.map(token => {
    const n = Number(token)
    if (isNaN(n)) {
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.warn(`[frame-svg] parseSpacing: token "${token}" is not a valid number — falling back to 0.`)
      }
      return 0
    }
    return n
  })
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]]
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]]
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]]
  return [parts[0], parts[1], parts[2], parts[3]]
}

// ─── Text measurement ─────────────────────────────────────────────────────────
// In browser: uses canvas API directly.
// In Node: uses @napi-rs/canvas (Skia) — call initCanvas() before rendering.

let _measureCanvas: { ctx: CanvasRenderingContext2D } | null = null
let _nodeFontFamily: string | null = null

// Call this once before rendering, in both Node and browser.
// In browser: waits for fonts to be ready so Inter is used for measurement.
// In Node: registers fonts via @napi-rs/canvas (Skia).
export async function initCanvas(fonts?: import('./types.ts').FontConfig[]): Promise<void> {
  if (typeof document !== 'undefined') {
    if (_measureCanvas) return
    await document.fonts.ready
    const firstFont = fonts?.find(f => f.family)
    if (firstFont) _nodeFontFamily = firstFont.family
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) _measureCanvas = { ctx }
    return
  }
  if (_measureCanvas) return
  const { createCanvas, GlobalFonts } = await import('@napi-rs/canvas')
  const { fileURLToPath } = await import('node:url')
  const { resolve, dirname } = await import('node:path')

  // Always load Inter as the default measurement font
  const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const interPath = resolve(pkgRoot, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')
  GlobalFonts.registerFromPath(interPath, 'Inter')
  _nodeFontFamily = 'Inter'

  // Register all user-provided fonts so each component's fontFamily is measured accurately
  for (const font of fonts ?? []) {
    if (font.src) GlobalFonts.registerFromPath(font.src, font.family)
  }
  // The first user font becomes the default (overrides Inter)
  const first = fonts?.find(f => f.src)
  if (first) _nodeFontFamily = first.family

  const canvas = createCanvas(1, 1)
  _measureCanvas = { ctx: canvas.getContext('2d') as unknown as CanvasRenderingContext2D }
}

function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (_measureCanvas) return _measureCanvas.ctx
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    _measureCanvas = { ctx }
    return ctx
  }
  return null
}

export function measureTextWidth(text: string, fontSize: number, fontFamily = 'system-ui, sans-serif', fontWeight?: string | number): number {
  const ctx = getCanvasCtx()
  if (!ctx) return 0
  const weight = fontWeight ? `${fontWeight} ` : ''
  // Use the component's fontFamily if specified, fallback to the default measurement font
  const family = fontFamily !== 'system-ui, sans-serif' ? fontFamily : (_nodeFontFamily ?? fontFamily)
  ctx.font = `${weight}${fontSize}px ${family}`
  return ctx.measureText(text).width
}

export function wrapText(
  text: string | undefined,
  maxWidth: number,
  fontSize: number,
  fontFamily?: string,
  fontWeight?: string | number,
): string[] {
  if (!text || maxWidth <= 0) return ['']
  const words = String(text).trim().split(/\s+/)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (measureTextWidth(candidate, fontSize, fontFamily, fontWeight) > maxWidth && line) {
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
