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
      │  Dispatches to each primitive's resolveLayout()
      │
      ▼  Renderer (core/renderer.ts)
         Dispatches to each primitive's render() → SVG string
```

## LayoutNode tree

Every component call (`<Container>`, `<Text>`, ...) produces a `LayoutNode`:

```ts
interface LayoutNode {
  type: NodeType   // 'container' | 'template' | 'text' | 'circle' | 'line' | 'spacer' | 'icon'
  props: NodeProps
  animate?: Animate
  children: LayoutNode[]
}
```

The JSX runtime (`h()`) builds these objects — no virtual DOM, no diffing.

## Self-contained primitives

Each primitive lives in its own file and exports three things: a factory function, a `resolveLayout` function, and a `render` function, grouped in a `Primitive` object registered by type string.

```ts
// core/primitive.ts
interface Primitive {
  render(node: ResolvedNode, ctx: RenderContext): string
  resolveLayout(node: LayoutNode, availableWidth: number, ctx: LayoutContext): ResolvedNode
}
```

Shared helpers live in `core/render-helpers.ts` (SVG attributes, gradients, shadows, `applyAnimate`) and `core/layout-helpers.ts` (width/height resolution, child positioning).

## Dispatcher pattern

`core/layout.ts` and `core/renderer.ts` are thin dispatchers: they look up the matching `Primitive` by `node.type` in `core/registry.ts` and delegate 100% of work to it.

```ts
// core/registry.ts
const REGISTRY: Record<NodeType, Primitive> = {
  container: ContainerPrimitive,
  template:  TemplatePrimitive,
  text:      TextPrimitive,
  // ...
}
```

## Layout engine

`resolveLayout()` computes `_width`, `_height`, `_x`, `_y` for every node:

1. **Intrinsic sizing** — nodes without explicit width/height measure their content
2. **Stretch pass** — `width="100%"` nodes fill their parent
3. **Position pass** — children are placed according to `direction`, `gap`, `align`, `justify`

## Renderer

`renderSvg()` walks the `ResolvedNode` tree. Gradients and filter effects go into `<defs>` and are referenced by id. Theme variables (`$accent`, `$text`, etc.) become CSS class names (`f-accent`, `f-text`) rather than inline `fill` attributes — this is what allows a single SVG to support both dark and light modes. Animation `@keyframes` are embedded in the `<style>` block alongside theme rules.

## Vite plugin

`plugins/frame.ts` intercepts `.frame` file imports. It:

1. Strips the front-matter header (if any)
2. Adds auto-imports (`h`, primitives, compound components)
3. Hands the resulting TSX to esbuild for compilation

`.frame` files behave like normal TypeScript modules — you can import between them, export functions, use types, etc.

## Theme CSS injection

In the dev server, `theme-css.ts` generates and injects a `<style>` tag with the CSS rules for all variables. When the user overrides variables in their `main.frame`, the injected CSS reflects those overrides automatically — no hardcoded values anywhere.

## Adding a new compound component

1. Create `components/compounds/my-component.ts` — export a function that returns a `LayoutNode` tree using primitives
2. Export it from `components/compounds/index.ts`
3. Run `npm run schema` to update autocomplete
4. Run `npm run ext:install` and restart VSCode
