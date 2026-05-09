import type { Plugin } from 'vite'
import { transformWithEsbuild } from 'vite'
import { readFile } from 'node:fs/promises'

// ─── Front-matter parser ──────────────────────────────────────────────────────

function parseFrontMatter(src: string): { data: Record<string, string>; body: string } {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: src }

  const data: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon < 0) continue
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim()
    if (key) data[key] = val
  }

  return { data, body: match[2] }
}

// ─── Body parser ──────────────────────────────────────────────────────────────
// Extracts leading import statements from the body so they can be hoisted
// above the auto-imports, and detects whether the file is a page (JSX root)
// or a component module (starts with export).

function parseBody(body: string): {
  leadingImports: string[]
  rest: string
  isComponent: boolean
} {
  const lines = body.split('\n')
  const leadingImports: string[] = []
  let i = 0

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (trimmed === '' || trimmed.startsWith('//')) { i++; continue }
    if (trimmed.startsWith('import ')) { leadingImports.push(lines[i]); i++; continue }
    // re-exports: export { X } or export { X } from '...' — no function/const body
    if (trimmed.startsWith('export ') && !trimmed.match(/^export\s+(function|const|let|var|class|default)\b/)) {
      leadingImports.push(lines[i]); i++; continue
    }
    break
  }

  const rest = lines.slice(i).join('\n').trim()
  const isComponent = /^export\s+(function|const|let|var|class)\b/.test(rest)

  return { leadingImports, rest, isComponent }
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export function framePlugin(): Plugin {
  return {
    name: 'frame-svg:compiler',
    enforce: 'pre',

    async load(id) {
      const cleanId = id.split('?')[0]
      if (!cleanId.endsWith('.frame')) return null

      const code = await readFile(cleanId, 'utf-8')
      const { body } = parseFrontMatter(code)
      const { leadingImports, rest, isComponent } = parseBody(body)

      const tsxSource = [
        `/** @jsxRuntime classic */`,
        `/** @jsx h */`,
        `import { h } from 'frame-svg/jsx'`,
        `import { Page, Stack, Box, Text, Circle, Image, Line, Grid, Spacer } from 'frame-svg/components'`,
        `import { Card, Avatar, Callout, FeatureList, FileTree, KeyCombo, Stat, Icon } from 'frame-svg/compound'`,
        ...leadingImports,
        ``,
        isComponent
          ? rest
          : `export default (\n${rest}\n)`,
      ].join('\n')

      const result = await transformWithEsbuild(tsxSource, cleanId + '.tsx', {
        loader: 'tsx',
        jsx: 'transform',
        jsxFactory: 'h',
        jsxFragment: 'null',
        target: 'esnext',
      })

      return { code: result.code, map: result.map }
    },
  }
}
