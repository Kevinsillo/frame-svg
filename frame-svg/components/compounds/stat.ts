import { Container } from '@/components/primitives/container.ts'
import { Text } from '@/components/primitives/text.ts'
import type { LayoutNode, SpacingValue, GradientBackground, Shadow, BorderProps } from '@/core/types.ts'

export interface StatProps {
  value: string | number
  label: string
  trend?: string
  trendUp?: boolean
  icon?: string
  width?: number | string
  padding?: SpacingValue
  background?: string | GradientBackground
  border?: BorderProps | null
  shadow?: Shadow
}

export function Stat({
  value,
  label,
  trend,
  trendUp,
  icon,
  width = '100%',
  padding = '20 24',
  background = '$surface',
  border,
  shadow,
}: StatProps): LayoutNode {
  const items: LayoutNode[] = []

  if (icon) {
    items.push(
      Container(
        { direction: 'horizontal', gap: 10, align: 'center' },
        Text({ fontSize: 22 }, icon),
        Text({ fontSize: 30, fontWeight: '700', color: '$text' }, String(value)),
      ),
    )
  } else {
    items.push(Text({ fontSize: 30, fontWeight: '700', color: '$text' }, String(value)))
  }

  items.push(Text({ fontSize: 13, color: '$muted', margin: '4 0 0 0' }, label))

  if (trend !== undefined) {
    const trendColor = trendUp === undefined ? '$muted' : trendUp ? '$success' : '$danger'
    items.push(Text({ fontSize: 12, fontWeight: '600', color: trendColor, margin: '4 0 0 0' }, trend))
  }

  return Container(
    { background, radius: 12, padding, width, border, shadow } as Parameters<typeof Container>[0],
    Container({ gap: 0 }, ...items),
  )
}
