import { Box } from '../box.ts'
import { Stack } from '../stack.ts'
import { Text } from '../text.ts'
import type { LayoutNode, BoxProps, GradientBackground, Shadow, SpacingValue, BorderProps } from '../../core/types.ts'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

const VARIANT_COLORS: Record<AlertVariant, { bg: string; border: string; icon: string; iconBg: string; title: string }> = {
  info:    { bg: '$accentBg',  border: '$accent',  icon: 'i',  iconBg: '$accent',  title: '$accent'  },
  success: { bg: '$successBg', border: '$success', icon: '✓',  iconBg: '$success', title: '$success' },
  warning: { bg: '$warningBg', border: '$warning', icon: '!',  iconBg: '$warning', title: '$warning' },
  danger:  { bg: '$dangerBg',  border: '$danger',  icon: '✕',  iconBg: '$danger',  title: '$danger'  },
}

export interface AlertProps {
  // Content
  message: string
  title?: string
  variant?: AlertVariant

  // Layout
  width?: number | string
  padding?: SpacingValue
  radius?: number

  // Visual overrides
  background?: string | GradientBackground
  shadow?: Shadow
}

export function Alert({
  message,
  title,
  variant = 'info',
  width = '100%',
  padding = '14 16',
  radius = 10,
  background,
  shadow,
}: AlertProps): LayoutNode {
  const colors = VARIANT_COLORS[variant]
  const bg = background ?? colors.bg
  const border: BorderProps = { width: 1, color: colors.border }

  const icon = Box(
    { width: 22, height: 22, radius: 11, background: colors.iconBg, margin: '0 12 0 0' },
    Text({ fontSize: 11, fontWeight: '700', color: '$surface', textAlign: 'center', padding: '4 0 0 0' }, colors.icon),
  )

  const contentItems: LayoutNode[] = []

  if (title) {
    contentItems.push(
      Text({ fontSize: 14, fontWeight: '700', color: colors.title }, title)
    )
  }

  contentItems.push(
    Text({ fontSize: 13, color: '$text', margin: title ? '3 0 0 0' : '0' }, message)
  )

  const content = Stack({ gap: 0 }, ...contentItems)

  return Box(
    { background: bg, radius, padding, width, border, shadow } as BoxProps,
    Stack({ direction: 'horizontal', gap: 0, align: 'center' },
      icon,
      content,
    ),
  )
}
