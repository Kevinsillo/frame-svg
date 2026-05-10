import { renderSvg } from '@/core/index.ts'
import type { TemplateProps } from '@/core/types.ts'
import type { ContainerProps } from '@/components/primitives/container.ts'
import design from '@/src/main.frame'
import { injectThemeCss } from '@/theme-css.ts'
import { theme as defaultTheme } from '@/themes/theme.ts'
import { initCanvas } from '@/core/utils.ts'

const options = (design.props as TemplateProps).theme ?? {}
const pageWidth = Number((design.children[0]?.props as ContainerProps)?.width ?? 800)

const tokens = {
    ...defaultTheme.variables,
    ...options.variables,
}
injectThemeCss(tokens)

await initCanvas(options.fonts)

const div = document.createElement('div')
div.style.width = `${pageWidth}px`
div.innerHTML = renderSvg(design)
document.body.appendChild(div)
