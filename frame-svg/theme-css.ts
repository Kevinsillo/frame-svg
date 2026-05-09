import type { ThemeVariables } from '@/core/types.ts'

export function generateThemeCss(tokens: ThemeVariables): string {
  const fillRules = (mode: 'dark' | 'light') =>
    Object.entries(tokens)
      .map(([name, val]) => `  .f-${name} { fill:   ${val[mode]} !important; }`)
      .join('\n')

  const strokeRules = (mode: 'dark' | 'light') =>
    Object.entries(tokens)
      .filter(([name]) => !name.endsWith('Bg'))
      .map(([name, val]) => `  .s-${name} { stroke: ${val[mode]} !important; }`)
      .join('\n')

  return [
    `html[data-theme="dark"] {`,
    fillRules('dark'),
    strokeRules('dark'),
    `}`,
    `html[data-theme="light"] {`,
    fillRules('light'),
    strokeRules('light'),
    `}`,
  ].join('\n')
}

export function injectThemeCss(tokens: ThemeVariables): void {
  const existing = document.getElementById('frame-theme-css')
  if (existing) existing.remove()

  const style = document.createElement('style')
  style.id = 'frame-theme-css'
  style.textContent = generateThemeCss(tokens)
  document.head.appendChild(style)
}
