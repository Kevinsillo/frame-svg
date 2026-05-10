// Aggregated icon registry — one file per icon under this directory.
// Each icon module exports `default` as a string[] of SVG path d-attributes,
// designed for a 24x24 viewBox, stroke-based (fill="none"),
// stroke-width=2, stroke-linecap=round, stroke-linejoin=round.

import info from '@/components/primitives/icons/info.ts'
import lightbulb from '@/components/primitives/icons/lightbulb.ts'
import triangleAlert from '@/components/primitives/icons/triangle-alert.ts'
import bell from '@/components/primitives/icons/bell.ts'
import check from '@/components/primitives/icons/check.ts'
import x from '@/components/primitives/icons/x.ts'
import star from '@/components/primitives/icons/star.ts'
import flame from '@/components/primitives/icons/flame.ts'
import zap from '@/components/primitives/icons/zap.ts'
import download from '@/components/primitives/icons/download.ts'
import link from '@/components/primitives/icons/link.ts'
import arrowRight from '@/components/primitives/icons/arrow-right.ts'
import arrowLeft from '@/components/primitives/icons/arrow-left.ts'
import arrowUp from '@/components/primitives/icons/arrow-up.ts'
import arrowDown from '@/components/primitives/icons/arrow-down.ts'
import code from '@/components/primitives/icons/code.ts'
import terminal from '@/components/primitives/icons/terminal.ts'
import file from '@/components/primitives/icons/file.ts'
import folder from '@/components/primitives/icons/folder.ts'
import tag from '@/components/primitives/icons/tag.ts'
import pkg from '@/components/primitives/icons/package.ts'
import shield from '@/components/primitives/icons/shield.ts'
import lock from '@/components/primitives/icons/lock.ts'
import user from '@/components/primitives/icons/user.ts'
import users from '@/components/primitives/icons/users.ts'
import clock from '@/components/primitives/icons/clock.ts'

export const ICONS = {
  // ─── Callout icons ────────────────────────────────────────────────────────
  info,
  lightbulb,
  'triangle-alert': triangleAlert,
  bell,

  // ─── Status ───────────────────────────────────────────────────────────────
  check,
  x,
  star,
  flame,

  // ─── Actions ──────────────────────────────────────────────────────────────
  zap,
  download,
  link,
  'arrow-right': arrowRight,
  'arrow-left': arrowLeft,
  'arrow-up': arrowUp,
  'arrow-down': arrowDown,

  // ─── Content ──────────────────────────────────────────────────────────────
  code,
  terminal,
  file,
  folder,
  tag,
  package: pkg,

  // ─── Security ─────────────────────────────────────────────────────────────
  shield,
  lock,

  // ─── People ───────────────────────────────────────────────────────────────
  user,
  users,

  // ─── Meta ─────────────────────────────────────────────────────────────────
  clock,
} as const

export type IconName = keyof typeof ICONS
