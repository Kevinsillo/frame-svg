import { Container } from '@/components/primitives/container.ts'
import { Spacer } from '@/components/primitives/spacer.ts'
import { Text } from '@/components/primitives/text.ts'
import { Icon } from '@/components/primitives/icon.ts'
import type { LayoutNode, SpacingValue } from '@/core/types.ts'

export interface FileTreeItem {
  name: string
  type?: 'file' | 'dir'
  depth?: number
  highlight?: boolean
  comment?: string
}

export interface FileTreeProps {
  items: FileTreeItem[]
  root?: string
  width?: number | string
  padding?: SpacingValue
}

export function FileTree({
  items,
  root,
  width = '100%',
  padding = '14 16',
}: FileTreeProps): LayoutNode {
  const rows: LayoutNode[] = []

  if (root) {
    rows.push(
      Container(
        { direction: 'horizontal', gap: 8, align: 'center' },
        Icon({ name: 'folder', size: 14, color: '$accent' }),
        Text({ fontSize: 13, fontWeight: '700', color: '$text' }, `${root}/`),
      ),
    )
  }

  for (const item of items) {
    const { name, type = 'file', depth = 0, highlight = false, comment } = item
    const indent     = ((root ? 1 : 0) + depth) * 18
    const isDir      = type === 'dir'
    const iconName   = isDir ? 'folder' : 'file'
    const iconColor  = highlight ? '$accent' : isDir ? '$accent' : '$muted'
    const nameColor  = highlight ? '$accent' : isDir ? '$text'   : '$muted'
    const fontWeight = isDir ? '600' : '400'
    const display    = isDir ? `${name}/` : name

    const innerChildren: LayoutNode[] = [
      ...(indent > 0 ? [Spacer({ width: indent })] : []),
      Icon({ name: iconName, size: 13, color: iconColor, margin: '0 6 0 0' }),
      Text({ fontSize: 13, fontWeight, color: nameColor }, display),
      ...(comment ? [Text({ fontSize: 11, color: highlight ? '$accent' : '$faint', margin: '0 0 0 10' }, comment)] : []),
    ]

    const rowStack = Container({ direction: 'horizontal', gap: 0, align: 'center' }, ...innerChildren)

    rows.push(
      highlight
        ? Container({ background: '$accentBg', radius: 4, padding: '3 0' }, rowStack)
        : rowStack,
    )
  }

  return Container(
    { background: '$surface', radius: 10, padding, width },
    Container({ gap: 6 }, ...rows),
  )
}
