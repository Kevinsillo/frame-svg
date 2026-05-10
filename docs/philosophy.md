[← README](../README.md)

# Philosophy

## What is a `.frame` file?

A `.frame` file is JSX that describes an SVG layout. It looks like a React component but has no runtime — it compiles directly to an SVG file.

```tsx
export default (
  <Page width={800}>
    <Stack gap={24} padding={40}>
      <Text fontSize={32} fontWeight="700" color="$text">My design</Text>
    </Stack>
  </Page>
)
```

## The Vue model

frame-svg follows the same convention as Vue:

| Vue | frame-svg |
|-----|-----------|
| `src/main.js` | `src/main.frame` |
| `src/components/*.vue` | `src/frames/*.frame` |

`src/main.frame` is the **only file that gets rendered**. Everything in `src/frames/` is imported by it, not rendered independently.

## Components as reusable pieces

If your main frame grows large, extract parts into component files:

```
src/
├── main.frame
└── components/
    ├── header.frame
    └── stats-row.frame
```

`header.frame` exports a component:

```tsx
export function Header({ title }: { title: string }) {
  return (
    <Stack direction="horizontal" padding="16 24" background="$surface">
      <Text fontSize={18} fontWeight="700" color="$text">{title}</Text>
    </Stack>
  )
}
```

`main.frame` imports and uses it:

```tsx
import { Header } from './components/header.frame'

export default (
  <Page width={800}>
    <Header title="Release Notes" />
  </Page>
)
```

## What frame-svg is NOT

- Not a UI framework — it generates static SVGs, not interactive UIs
- Not React — the JSX is compiled at build time, no virtual DOM
- Not a diagram tool — it's a code-first SVG layout engine

## When to use it

- README banners and badges
- Documentation visuals
- Social preview images
- Design system snapshots
- Any graphic you'd rather write than draw
