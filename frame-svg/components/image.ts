import type { LayoutNode, ImageProps } from '../core/types.ts'

export function Image(props: ImageProps): LayoutNode {
  return { type: 'image', props, children: [] }
}

// Helper: fetch a remote image and return it as a base64 data URI
export async function loadImage(url: string): Promise<string> {
  if (typeof fetch !== 'undefined') {
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    const mime = res.headers.get('content-type') ?? 'image/png'
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
    return `data:${mime};base64,${b64}`
  }
  // Node: use native fetch (Node 18+)
  throw new Error('loadImage requires fetch. Use Node 18+ or a browser environment.')
}
