import { Box } from '@/components/primitives/box.ts'
import { Stack } from '@/components/primitives/stack.ts'
import { Text } from '@/components/primitives/text.ts'
import { Icon } from '@/components/compounds/icon.ts'
import type { IconName } from '@/components/primitives/icons.ts'
import type { LayoutNode, SpacingValue } from '@/core/types.ts'

type CalloutVariant = 'note' | 'tip' | 'warning' | 'important'

const VARIANT_CONFIG: Record<CalloutVariant, {
  icon: IconName; label: string; bg: string; border: string; color: string
}> = {
  note:      { icon: 'info',            label: 'NOTE',      bg: '$accentBg',  border: '$accent',  color: '$accent'  },
  tip:       { icon: 'lightbulb',       label: 'TIP',       bg: '$successBg', border: '$success', color: '$success' },
  warning:   { icon: 'triangle-alert',  label: 'WARNING',   bg: '$warningBg', border: '$warning', color: '$warning' },
  important: { icon: 'bell',            label: 'IMPORTANT', bg: '$dangerBg',  border: '$danger',  color: '$danger'  },
}

export interface CalloutProps {
  variant?: CalloutVariant
  message: string
  width?: number | string
  margin?: SpacingValue
}

export function Callout({
  variant = 'note',
  message,
  width = '100%',
  margin,
}: CalloutProps): LayoutNode {
  const c = VARIANT_CONFIG[variant]

  const header = Stack(
    { direction: 'horizontal', gap: 6, align: 'center', margin: '0 0 6 0' },
    Icon({ name: c.icon, size: 14, color: c.color }),
    Text({ fontSize: 12, fontWeight: '700', color: c.color }, c.label),
  )

  return Box(
    { background: c.border, radius: 8, padding: '0 0 0 4', width, margin },
    Box(
      { background: c.bg, radius: 6, padding: '12 16' },
      Stack({ gap: 0 }, header, Text({ fontSize: 13, color: '$text' }, message)),
    ),
  )
}
