import { Box } from '../box.ts'
import { Stack } from '../stack.ts'
import { Text } from '../text.ts'
import type { LayoutNode, SpacingValue } from '../../core/types.ts'

type CalloutVariant = 'note' | 'tip' | 'warning' | 'important' | 'caution'

const VARIANT_CONFIG: Record<CalloutVariant, {
  icon: string; label: string; bg: string; border: string; color: string
}> = {
  note:      { icon: 'ℹ', label: 'NOTE',      bg: '$accentBg',  border: '$accent',  color: '$accent'  },
  tip:       { icon: '✦', label: 'TIP',       bg: '$successBg', border: '$success', color: '$success' },
  warning:   { icon: '▲', label: 'WARNING',   bg: '$warningBg', border: '$warning', color: '$warning' },
  important: { icon: '!', label: 'IMPORTANT', bg: '$dangerBg',  border: '$danger',  color: '$danger'  },
  caution:   { icon: '⚠', label: 'CAUTION',   bg: '$warningBg', border: '$warning', color: '$warning' },
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

  return Box(
    { background: c.border, radius: 8, padding: '0 0 0 4', width, margin },
    Box(
      { background: c.bg, radius: 6, padding: '12 16' },
      Stack(
        { gap: 0 },
        Text({ fontSize: 12, fontWeight: '700', color: c.color, margin: '0 0 6 0' }, `${c.icon}  ${c.label}`),
        Text({ fontSize: 13, color: '$text' }, message),
      ),
    ),
  )
}
