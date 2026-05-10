import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const root = resolve('.')

// ─── Types ────────────────────────────────────────────────────────────────────

type PropType = 'enum' | 'number' | 'bool' | 'spacing' | 'size' | 'color' | 'object' | 'string'

interface PropDef {
  name: string
  type: PropType
  values?: string[]
  detail: string
}

interface ComponentDef {
  container: boolean
  props: PropDef[]
}

// ─── Prop type inference ──────────────────────────────────────────────────────

const COLOR_NAMES  = /^(background|color|avatarColor|avatarBg)$/
const SIZE_NAMES   = /^(width|height|length)$/
const OBJECT_TYPES = /GradientBackground|Shadow\b|BorderProps|FontConfig/

function inferPropMeta(name: string, typeStr: string): Omit<PropDef, 'name'> {
  const enumValues = [...typeStr.matchAll(/'([^']+)'/g)].map(m => m[1])
  if (enumValues.length > 0) {
    return { type: 'enum', values: enumValues, detail: typeStr }
  }

  if (typeStr === 'boolean') {
    return { type: 'bool', detail: 'boolean' }
  }

  if (typeStr.includes('SpacingValue') || /^(padding|margin)$/.test(name)) {
    return { type: 'spacing', detail: 'number | "t r b l"' }
  }

  if (COLOR_NAMES.test(name)) {
    return { type: 'color', detail: 'string | $theme' }
  }

  if (OBJECT_TYPES.test(typeStr)) {
    const detail = typeStr.includes('Shadow')      ? '{ x?, y?, blur?, color? }' :
                   typeStr.includes('BorderProps') ? '{ width, color }' :
                   '{ type, stops, ... }'
    return { type: 'object', detail }
  }

  if (SIZE_NAMES.test(name) || (typeStr.includes('number') && typeStr.includes('string'))) {
    return { type: 'size', detail: 'number | string | "fit-content" | "100%"' }
  }

  if (/^number(\s*\|\s*null)?$/.test(typeStr)) {
    return { type: 'number', detail: 'number' }
  }

  return { type: 'string', detail: 'string' }
}

// ─── Interface parser ─────────────────────────────────────────────────────────

function parseInterface(source: string, interfaceName: string): PropDef[] {
  const re = new RegExp(`(?:export )?interface ${interfaceName}\\s*\\{([^}]+)\\}`, 's')
  const match = source.match(re)
  if (!match) return []

  return match[1]
    .split('\n')
    .flatMap(line => {
      const m = line.match(/^\s+(\w+)\??:\s*(.+?)(?:\s*\/\/.*)?$/)
      if (!m) return []
      const [, name, rawType] = m
      return [{ name, ...inferPropMeta(name, rawType.trim()) }]
    })
}

// ─── Theme parser ─────────────────────────────────────────────────────────────

function parseThemeTokens(source: string): string[] {
  const match = source.match(/tokens\s*:\s*\{([\s\S]+?)\n\s*\}/)
  if (!match) return []
  return [...match[1].matchAll(/^\s{4}(\w+)\s*:/gm)].map(m => m[1])
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const [typesContent, primitiveContent, compoundContent] = await Promise.all([
  readFile(join(root, 'core/types.ts'), 'utf-8'),
  readFile(join(root, 'components/primitives/index.ts'), 'utf-8'),
  readFile(join(root, 'components/compounds/index.ts'), 'utf-8'),
])

// Build a source map: component name → file content, reading each component's own
// file. Both primitives and compounds colocate `*Props` interfaces with their
// implementation, so we scan both directories.
async function readSources(dir: string, sources: Map<string, string>): Promise<void> {
  const files = (await readdir(dir)).filter(f => f.endsWith('.ts') && f !== 'index.ts')
  for (const file of files) {
    const content = await readFile(join(dir, file), 'utf-8')
    const names = [...content.matchAll(/export interface (\w+)Props/g)].map(m => m[1])
    for (const name of names) sources.set(name, content)
  }
}

const componentSources = new Map<string, string>()
await readSources(join(root, 'components/primitives'), componentSources)
await readSources(join(root, 'components/compounds'), componentSources)

const CONTAINER_COMPONENTS = new Set(['Container', 'Template', 'Card'])

function extractExports(source: string): string[] {
  return [...source.matchAll(/export \{ ([^}]+) \}/g)]
    .flatMap(m => m[1].split(',').map(s => s.trim().split(/\s+/)[0]))
}

// `*Primitive` exports are runtime registry objects, not JSX components — they
// have no `*Props` interface and aren't meant to appear as VSCode completions.
const componentNames = [
  ...extractExports(primitiveContent),
  ...extractExports(compoundContent),
].filter(n => n !== 'loadImage' && /^[A-Z]/.test(n) && !n.endsWith('Primitive'))

const components: Record<string, ComponentDef> = {}
for (const name of componentNames) {
  const source = componentSources.get(name) ?? typesContent
  components[name] = {
    container: CONTAINER_COMPONENTS.has(name),
    props: parseInterface(source, `${name}Props`),
  }
}

const themeDir = join(root, 'themes')
const themes: Record<string, string[]> = {}
for (const file of await readdir(themeDir)) {
  if (!file.endsWith('.ts')) continue
  const content = await readFile(join(themeDir, file), 'utf-8')
  themes[file.replace('.ts', '')] = parseThemeTokens(content)
}

const schema = { version: 1, components, themes }
const outPath = join(root, '../vscode-extension/schema.json')
await writeFile(outPath, JSON.stringify(schema, null, 2) + '\n')

const propCount = Object.values(components).reduce((s, c) => s + c.props.length, 0)
console.log(`✓  vscode-extension/schema.json  (${componentNames.length} components, ${propCount} props, ${Object.keys(themes).length} themes)`)
