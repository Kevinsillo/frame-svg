import { renderSvg } from './core/index.ts'
import type { PageProps } from './core/types.ts'
import design from './src/main.frame'

const { theme: options = {}, width } = design.props as PageProps
const pageWidth = Number(width ?? 800)

const div = document.createElement('div')
div.style.width = `${pageWidth}px`
div.innerHTML = renderSvg(design, options)
document.body.appendChild(div)
