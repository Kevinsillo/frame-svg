import { Box } from '@/components/primitives/box.ts'
import { Stack } from '@/components/primitives/stack.ts'
import { Text } from '@/components/primitives/text.ts'
import { Line } from '@/components/primitives/line.ts'
import type { LayoutNode, BoxProps, GradientBackground, Shadow, SpacingValue, BorderProps } from '@/core/types.ts'

type BadgeVariant = 'success' | 'accent' | 'warning' | 'danger' | 'neutral'

const BADGE_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '$successBg', text: '$success' },
  accent:  { bg: '$accentBg',  text: '$accent'  },
  warning: { bg: '$warningBg', text: '$warning' },
  danger:  { bg: '$dangerBg',  text: '$danger'  },
  neutral: { bg: '$surface',   text: '$muted'   },
}

export interface CardProps {
  // Content
  title: string
  body?: string
  badge?: string
  badgeVariant?: 'success' | 'accent' | 'warning' | 'danger' | 'neutral'

  // Avatar/indicator
  avatar?: string   // single letter or emoji
  avatarColor?: string
  avatarBg?: string

  // Layout
  width?: number | string
  padding?: SpacingValue
  radius?: number

  // Visual
  background?: string | GradientBackground
  border?: BorderProps | null
  shadow?: Shadow
  divider?: boolean  // show line between header and body
}

export function Card({
  title,
  body,
  badge,
  badgeVariant = 'neutral',
  avatar,
  avatarColor,
  avatarBg,
  width = '100%',
  padding = 20,
  radius = 12,
  background = '$surface',
  border,
  shadow,
  divider = false,
}: CardProps): LayoutNode {
  const badgeColors = BADGE_COLORS[badgeVariant]
  const children: LayoutNode[] = []

  // Header row: avatar + title + badge
  const headerItems: LayoutNode[] = []

  if (avatar) {
    headerItems.push(
      Box(
        { width: 32, height: 32, radius: 16, background: avatarBg ?? badgeColors.bg, margin: '0 12 0 0' },
        Text({ fontSize: 14, fontWeight: '700', color: avatarColor ?? badgeColors.text, textAlign: 'center', padding: '8 0 0 0' }, avatar),
      )
    )
  }

  headerItems.push(
    Stack(
      { gap: 0 },
      Text({ fontSize: 15, fontWeight: '600', color: '$text' }, title),
    )
  )

  if (badge) {
    headerItems.push(
      Box(
        { background: badgeColors.bg, radius: 6, padding: '4 10', margin: '0 0 0 12', width: 'fit-content' },
        Text({ fontSize: 11, fontWeight: '700', color: badgeColors.text }, badge),
      )
    )
  }

  children.push(
    Stack({ direction: 'horizontal', gap: 0, align: 'center' }, ...headerItems)
  )

  if (divider && body) {
    children.push(Line({ color: '$subtle', margin: '12 0 4 0' }))
  }

  if (body) {
    children.push(
      Text({ fontSize: 13, color: '$muted', margin: divider ? '0' : '12 0 0 0' }, body)
    )
  }

  return Box(
    { background, radius, padding, width, border, shadow } as BoxProps,
    Stack({ gap: 0 }, ...children),
  )
}
