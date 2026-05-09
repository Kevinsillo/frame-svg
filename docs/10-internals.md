[← README](../README.md)

# Internals

How frame-svg works under the hood — useful if you want to understand the pipeline or extend the framework.

## The pipeline

```
src/main.frame
      │
      ▼  Vite plugin (plugins/frame.ts)
      │  Transforms .frame → TSX → JS module
      │
      ▼  JSX runtime (core/jsx.ts)
      │  h() calls build a LayoutNode tree
      │
      ▼  Layout engine (core/layout.ts)
      │  Resolves widths, heights, positions (flexbox model)
      │
      ▼  Renderer (core/renderer.ts)
         Walks the resolved tree → SVG string
```

## LayoutNode tree

Every component call (`<Box>`, `<Text>`, ...) produces a `LayoutNode`:

```ts
interface LayoutNode {
  type: 'box' | 'text' | 'stack' | ...
  props: { ... }
  children: LayoutNode[]
}
```

The JSX runtime (`h()`) is just a function that builds these objects — no virtual DOM, no diffing.

## Layout engine

`resolveLayout()` in `core/layout.ts` takes the root `LayoutNode` and computes `_width`, `_height`, `_x`, `_y` for every node. It implements a simplified flexbox model:

1. **Intrinsic sizing** — nodes without explicit width/height measure their content
2. **Stretch pass** — `width="100%"` nodes fill their parent
3. **Position pass** — children are placed according to `direction`, `gap`, `align`, `justify`

## Renderer

`renderSvg()` in `core/renderer.ts` walks the `ResolvedNode` tree and outputs SVG elements. Gradients and filter effects go into `<defs>` and are referenced by id.

Theme variables (`$accent`, `$text`, etc.) become CSS class names (`f-accent`, `f-text`) rather than inline `fill` attributes. This is what allows a single SVG to support both dark and light modes.

## Vite plugin

`plugins/frame.ts` intercepts `.frame` file imports. It:

1. Strips the front-matter header (if any)
2. Adds auto-imports (`h`, primitives, compound components)
3. Hands the resulting TSX to esbuild for compilation

This means `.frame` files behave like normal TypeScript modules — you can import between them, export functions, use types, etc.

## Theme CSS injection

In the dev server, `theme-css.ts` generates and injects a `<style>` tag with the CSS rules for all variables. When the user overrides variables in their `main.frame`, the injected CSS reflects those overrides automatically — no hardcoded values anywhere.

## Adding a new component

1. Create `components/my-component.ts` — export a function that returns a `LayoutNode` tree using primitives
2. Export it from `components/compounds/index.ts`
3. Run `npm run schema` to update autocomplete
4. Run `npm run ext:install` and restart VSCode
