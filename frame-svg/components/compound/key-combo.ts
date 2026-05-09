import { Box } from '../box.ts'
import { Stack } from '../stack.ts'
import { Text } from '../text.ts'
import type { LayoutNode, SpacingValue } from '../../core/types.ts'

export interface KeyComboProps {
  keys: string[]
  separator?: string
  margin?: SpacingValue
}

export function KeyCombo({
  keys,
  separator = '+',
  margin,
}: KeyComboProps): LayoutNode {
  const children: LayoutNode[] = []

  keys.forEach((key, i) => {
    if (i > 0) {
      children.push(
        Box(
          { width: 'fit-content', padding: '0 6' },
          Text({ fontSize: 12, color: '$muted' }, separator),
        ),
      )
    }
    children.push(
      Box(
        {
          width: 'fit-content',
          background: '$raised',
          border: { width: 1, color: '$subtle' },
          radius: 6,
          padding: '5 10',
          shadow: { x: 0, y: 2, blur: 0, color: '$subtle' },
        },
        Text({ fontSize: 13, fontWeight: '600', color: '$text', textAlign: 'center' }, key),
      ),
    )
  })

  return Stack({ direction: 'horizontal', gap: 0, align: 'center', margin }, ...children)
}
