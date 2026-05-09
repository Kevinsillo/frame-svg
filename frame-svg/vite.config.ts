import { defineConfig } from 'vite'
import { framePlugin } from './plugins/frame.ts'
import path from 'node:path'

export default defineConfig({
  plugins: [framePlugin()],
  optimizeDeps: {
    exclude: ['@napi-rs/canvas'],
  },
  resolve: {
    alias: [
      { find: '@',                     replacement: path.resolve('.') },
      { find: 'frame-svg/jsx',        replacement: path.resolve('./core/jsx.ts') },
      { find: 'frame-svg/components',  replacement: path.resolve('./components/index.ts') },
      { find: 'frame-svg/primitives',  replacement: path.resolve('./components/primitives/index.ts') },
      { find: 'frame-svg/compounds',   replacement: path.resolve('./components/compounds/index.ts') },
      { find: 'frame-svg/compound',    replacement: path.resolve('./components/compounds/index.ts') },
      { find: 'frame-svg/community',   replacement: path.resolve('./components/community/index.ts') },
      { find: /^frame-svg\/themes\/(.+)$/, replacement: path.resolve('./themes/$1.ts') },
    ],
  },
})
