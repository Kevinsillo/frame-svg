import type { RenderOptions } from '@/core/types.ts'

export const theme: RenderOptions = {
  fonts: [],
  variables: {
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
  },
  animation: {
    duration: { fast: '150ms', base: '300ms', slow: '600ms' },
    easing: {
      default: 'ease-in-out',
      bounce:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
      linear:  'linear',
    },
    presets: {
      fadeIn: {
        keyframes: { from: { opacity: '0' }, to: { opacity: '1' } },
        duration: '300ms',
        easing: 'ease-out',
      },
      fadeOut: {
        keyframes: { from: { opacity: '1' }, to: { opacity: '0' } },
        duration: '300ms',
        easing: 'ease-in',
      },
      slideUp: {
        keyframes: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        duration: '400ms',
        easing: 'ease-out',
      },
      slideDown: {
        keyframes: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        duration: '400ms',
        easing: 'ease-out',
      },
      pulse: {
        keyframes: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        duration: '2s',
        easing: 'ease-in-out',
        iteration: 'infinite',
      },
      bounce: {
        keyframes: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        duration: '800ms',
        easing: 'ease-in-out',
        iteration: 'infinite',
      },
    },
  },
}
