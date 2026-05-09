import { renderSvg } from './core/index.ts'
import type { PageProps } from './core/types.ts'
import design from './src/main.frame'
import { injectThemeCss } from './theme-css.ts'
import { theme as defaultTheme } from './themes/theme.ts'

const { theme: options = {}, width } = design.props as PageProps
const pageWidth = Number(width ?? 800)

const tokens = {
    ...defaultTheme.theme!.tokens,
    ...options.theme?.tokens,
}
injectThemeCss(tokens)

const div = document.createElement('div')
div.style.width = `${pageWidth}px`
div.innerHTML = renderSvg(design, options)
document.body.appendChild(div)
