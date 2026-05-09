import { Box } from '../box.ts'
import { Stack } from '../stack.ts'
import { Text } from '../text.ts'
import type { LayoutNode, SpacingValue } from '../../core/types.ts'

export interface FeatureItem {
  label: string
  checked?: boolean
  description?: string
}

export interface FeatureListProps {
  items: FeatureItem[]
  width?: number | string
  padding?: SpacingValue
  gap?: number
}

export function FeatureList({
  items,
  width = '100%',
  padding = '14 16',
  gap = 10,
}: FeatureListProps): LayoutNode {
  const rows = items.map(({ label, checked, description }) => {
    const icon      = checked === true ? '✓' : checked === false ? '✕' : '·'
    const iconBg    = checked === true ? '$successBg' : checked === false ? '$dangerBg' : '$raised'
    const iconColor = checked === true ? '$success'   : checked === false ? '$danger'   : '$muted'

    const iconNode = Box(
      { width: 20, height: 20, radius: 10, background: iconBg, margin: '0 10 0 0' },
      Text({ fontSize: 11, fontWeight: '700', color: iconColor, textAlign: 'center', padding: '3 0 0 0' }, icon),
    )

    const content = description
      ? Stack(
          { gap: 2 },
          Text({ fontSize: 14, fontWeight: '500', color: '$text' }, label),
          Text({ fontSize: 12, color: '$muted' }, description),
        )
      : Text({ fontSize: 14, fontWeight: '500', color: '$text' }, label)

    return Stack({ direction: 'horizontal', gap: 0, align: 'start' }, iconNode, content)
  })

  return Box(
    { background: '$surface', radius: 10, padding, width },
    Stack({ gap }, ...rows),
  )
}
