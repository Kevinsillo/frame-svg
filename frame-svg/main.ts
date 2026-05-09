import { renderSvg } from '@/core/index.ts'
import type { PageProps } from '@/core/types.ts'
import design from '@/src/main.frame'
import { injectThemeCss } from '@/theme-css.ts'
import { theme as defaultTheme } from '@/themes/theme.ts'
import { initCanvas } from '@/core/utils.ts'

const { theme: options = {}, width } = design.props as PageProps
const pageWidth = Number(width ?? 800)

const tokens = {
    ...defaultTheme.variables,
    ...options.variables,
}
injectThemeCss(tokens)

await initCanvas(options.fonts)

const div = document.createElement('div')
div.style.width = `${pageWidth}px`
div.innerHTML = renderSvg(design, options)
document.body.appendChild(div)
