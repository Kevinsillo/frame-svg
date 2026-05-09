import { execSync } from 'child_process'
import { existsSync, mkdirSync, rmSync } from 'fs'
import { symlink } from 'fs/promises'
import { resolve, join } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const EXT_SRC = join(ROOT, 'vscode-extension')
const EXT_NAME = 'frame-svg-language'

function getExtensionsDir() {
  const home = process.env.HOME || process.env.USERPROFILE
  if (process.platform === 'win32') return join(home, '.vscode', 'extensions')
  return join(home, '.vscode', 'extensions')
}

const EXT_DEST = join(getExtensionsDir(), EXT_NAME)

async function main() {
  if (existsSync(EXT_DEST)) {
    rmSync(EXT_DEST, { recursive: true, force: true })
    console.log(`Removed old: ${EXT_DEST}`)
  }

  mkdirSync(getExtensionsDir(), { recursive: true })
  await symlink(EXT_SRC, EXT_DEST, 'dir')
  console.log(`Linked: ${EXT_SRC} → ${EXT_DEST}`)
  console.log('Reload VSCode window to activate (Ctrl+Shift+P → "Reload Window")')
}

main().catch(e => { console.error(e); process.exit(1) })
