import type { RenderOptions } from '../core/types.ts'

export const theme: RenderOptions = {
  theme: { tokens: {
    bg:         { dark: '#0f172a', light: '#ffffff' },
    surface:    { dark: '#1e293b', light: '#f1f5f9' },
    raised:     { dark: '#334155', light: '#e2e8f0' },
    subtle:     { dark: '#475569', light: '#cbd5e1' },
    text:       { dark: '#f8fafc', light: '#0f172a' },
    muted:      { dark: '#94a3b8', light: '#64748b' },
    faint:      { dark: '#475569', light: '#94a3b8' },
    accent:     { dark: '#38bdf8', light: '#0284c7' },
    success:    { dark: '#4ade80', light: '#16a34a' },
    warning:    { dark: '#fbbf24', light: '#d97706' },
    danger:     { dark: '#f87171', light: '#dc2626' },
    accentBg:   { dark: '#0c4a6e', light: '#e0f2fe' },
    successBg:  { dark: '#166534', light: '#dcfce7' },
    warningBg:  { dark: '#78350f', light: '#fef3c7' },
    dangerBg:   { dark: '#7f1d1d', light: '#fee2e2' },
  }},
}
