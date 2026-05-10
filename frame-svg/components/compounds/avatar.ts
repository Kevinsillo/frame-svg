import { Circle } from '@/components/primitives/circle.ts'
import { Container } from '@/components/primitives/container.ts'
import { Text } from '@/components/primitives/text.ts'
import type { GradientBackground, LayoutNode, Shadow, SpacingValue } from '@/core/types.ts'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

const SIZE_MAP: Record<AvatarSize, { box: number; font: number; fontPad: string; dot: number }> = {
  xs: { box: 24, font: 10, fontPad: '6 0 0 0', dot: 6 },
  sm: { box: 32, font: 13, fontPad: '8 0 0 0', dot: 7 },
  md: { box: 40, font: 16, fontPad: '10 0 0 0', dot: 8 },
  lg: { box: 52, font: 20, fontPad: '14 0 0 0', dot: 10 },
  xl: { box: 68, font: 26, fontPad: '18 0 0 0', dot: 12 },
}

const STATUS_COLOR: Record<AvatarStatus, string> = {
  online: '$success',
  offline: '$muted',
  busy: '$danger',
  away: '$warning',
}

export interface AvatarProps {
  // Content — initials or emoji (max 2 chars)
  label?: string

  // Style
  size?: AvatarSize
  background?: string | GradientBackground
  color?: string
  shadow?: Shadow

  // Status indicator dot
  status?: AvatarStatus

  // Layout
  margin?: SpacingValue
}

export function Avatar({
  label,
  size = 'md',
  background = '$accentBg',
  color = '$accent',
  shadow,
  status,
  margin,
}: AvatarProps): LayoutNode {
  const { box, font, fontPad, dot } = SIZE_MAP[size]

  const avatarCircle = Container(
    { width: box, height: box, radius: box / 2, background, shadow },
    Text({ fontSize: font, fontWeight: '700', color, textAlign: 'center', padding: fontPad },
      (label ?? '?').slice(0, 2).toUpperCase()
    ),
  )

  if (!status) {
    return Container({ width: box, height: box, margin }, avatarCircle)
  }

  const statusDot = Circle({
    size: dot,
    background: STATUS_COLOR[status],
    border: { width: 2, color: '$surface' },
    margin: `0 0 0 -${dot + 2}`,
    animate: { preset: 'pulse' },
  })

  return Container(
    { direction: 'horizontal', gap: 0, align: 'start', width: box + dot + 2, margin },
    avatarCircle,
    statusDot,
  )
}
