import { Container } from '@/components/primitives/container.ts'
import { Text } from '@/components/primitives/text.ts'
import { Icon } from '@/components/primitives/icon.ts'
import type { LayoutNode, SpacingValue } from '@/core/types.ts'

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
    const iconBg    = checked === true ? '$successBg' : checked === false ? '$dangerBg' : '$raised'
    const iconColor = checked === true ? '$success'   : checked === false ? '$danger'   : '$muted'

    const iconNode = checked !== undefined
      ? Container(
          { width: 20, height: 20, radius: 10, background: iconBg, align: 'center', margin: '0 10 0 0' },
          Icon({ name: checked ? 'check' : 'x', size: 12, color: iconColor, strokeWidth: 2, margin: '4 0 0 0' }),
        )
      : Container(
          { width: 20, height: 20, radius: 10, background: iconBg, margin: '0 10 0 0' },
          Text({ fontSize: 11, fontWeight: '700', color: iconColor, textAlign: 'center', padding: '3 0 0 0' }, '·'),
        )

    const content = description
      ? Container(
          { gap: 2 },
          Text({ fontSize: 14, fontWeight: '500', color: '$text' }, label),
          Text({ fontSize: 12, color: '$muted' }, description),
        )
      : Text({ fontSize: 14, fontWeight: '500', color: '$text' }, label)

    return Container({ direction: 'horizontal', gap: 0, align: 'start' }, iconNode, content)
  })

  return Container(
    { background: '$surface', radius: 10, padding, width },
    Container({ gap }, ...rows),
  )
}
