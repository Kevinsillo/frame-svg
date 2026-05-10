[← README](../README.md)

# Getting Started

## Installation

Clone or copy the framework, then install dependencies:

```bash
cd frame-svg
npm install
```

## Start the dev server

```bash
npm run dev
```

Opens a live preview at `localhost:5173`. Every time you save a `.frame` file, the SVG updates automatically.

## Render to SVG

```bash
npm run render
```

Renders `src/main.frame` → `dist/main.svg`.

## Project structure

```
frame-svg/
├── src/
│   ├── main.frame        ← your entry point (edit this)
│   └── components/       ← reusable frames (import from main.frame)
├── dist/                 ← generated SVGs (git-ignored)
└── ...                   ← framework internals (don't touch)
```

The only folder you work in is `src/`. Everything else is framework internals.

## Your first frame

Edit `src/main.frame`:

```tsx
export default (
  <Template theme={theme}>
    <Container direction="vertical" gap={16} padding={32} background="$bg">
      <Text fontSize={28} fontWeight="700" color="$text">Hello, world</Text>
      <Text fontSize={14} color="$muted">Your first SVG, rendered from a .frame file.</Text>
    </Container>
  </Template>
)
```

Save → the preview updates → run `npm run render` to get the SVG.

## Next steps

- [Primitives](./primitives.md) — all layout components
- [Theme](./theme.md) — colors and dark/light mode
- [Philosophy](./philosophy.md) — understand the .frame model
