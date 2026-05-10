[← README](../README.md)

# Theme

frame-svg has a built-in theme variable system. Variables are named colors that resolve to different values in dark and light mode.

> The output SVG embeds both themes in a single file. Wherever you embed it — a GitHub README, a docs site, any webpage — it automatically matches the user's dark or light preference via `prefers-color-scheme`. No JavaScript, no duplicated files.

## Using variables

Prefix any color prop with `$` to use a variable:

```tsx
<Container background="$surface" border={{ width: 1, color: '$subtle' }}>
  <Text color="$text">Hello</Text>
  <Text color="$muted">Secondary</Text>
</Container>
```

## Available variables

| Variable | Dark | Light | Use for |
|-------|------|-------|---------|
| `$bg` | `#0f172a` | `#ffffff` | Page background |
| `$surface` | `#1e293b` | `#f1f5f9` | Cards, panels |
| `$raised` | `#334155` | `#e2e8f0` | Elevated elements |
| `$subtle` | `#475569` | `#cbd5e1` | Borders, dividers |
| `$text` | `#f8fafc` | `#0f172a` | Primary text |
| `$muted` | `#94a3b8` | `#64748b` | Secondary text |
| `$faint` | `#475569` | `#94a3b8` | Labels, captions |
| `$accent` | `#38bdf8` | `#0284c7` | Brand, interactive |
| `$success` | `#4ade80` | `#16a34a` | Positive states |
| `$warning` | `#fbbf24` | `#d97706` | Caution states |
| `$danger` | `#f87171` | `#dc2626` | Error states |
| `$accentBg` | `#0c4a6e` | `#e0f2fe` | Accent backgrounds |
| `$successBg` | `#166534` | `#dcfce7` | Success backgrounds |
| `$warningBg` | `#78350f` | `#fef3c7` | Warning backgrounds |
| `$dangerBg` | `#7f1d1d` | `#fee2e2` | Danger backgrounds |

## Dark / light toggle

The dev server preview has a toggle button (top right) to simulate both themes as you design.

## Customizing variables

All theme configuration lives in `themes/theme.ts`. Edit it directly — the `theme` object is passed as-is to `Template`:

```ts
// themes/theme.ts
export const theme: RenderOptions = {
  variables: {
    accent: { dark: '#a78bfa', light: '#7c3aed' },
    bg:     { dark: '#0a0a0f', light: '#fafafa'  },
    // only the variables you specify are overridden — the rest use the defaults
  },
}
```

```tsx
// src/main.frame
import { theme } from '../themes/theme.ts'

<Template theme={theme}>
  <Container padding={40} background="$bg">
    {/* your content */}
  </Container>
</Template>
```

## Custom fonts

Add font entries to `theme.fonts` in `themes/theme.ts`. The renderer embeds each font as base64 inside the SVG — no external requests.

```ts
// themes/theme.ts
export const theme: RenderOptions = {
  fonts: [
    { family: 'Inter', src: './assets/fonts/Inter-Regular.woff2', weight: 400 },
    { family: 'Inter', src: './assets/fonts/Inter-Bold.woff2',    weight: 700 },
  ],
  variables: { /* ... */ },
}
```

Then use `fontFamily` on any `Text`:

```tsx
<Text fontFamily="Inter" fontWeight="700" fontSize={24} color="$text">Custom font</Text>
```

| Field | Type | Description |
|-------|------|-------------|
| `family` | `string` | Font family name (matches `fontFamily` prop on `Text`) |
| `src` | `string` | Path to the font file, relative to the project root |
| `weight` | `number \| string` | Font weight, e.g. `400`, `700` |
| `style` | `'normal' \| 'italic'` | Font style (default `'normal'`) |

Place font files in `assets/fonts/` at the project root, alongside `src/`:

```
frame-svg/
├── assets/
│   └── fonts/
│       ├── Inter-Regular.woff2
│       └── Inter-Bold.woff2
├── src/
│   └── main.frame
└── dist/
```

---

## Animation tokens

`theme.animation` in `themes/theme.ts` configures timing defaults and named presets used by the `animate` prop:

```ts
// themes/theme.ts
export const theme: RenderOptions = {
  animation: {
    duration: { fast: '150ms', base: '300ms', slow: '600ms' },
    easing:   { default: 'ease-out', bounce: 'cubic-bezier(0.34,1.56,0.64,1)' },
    presets: {
      pop: {
        keyframes: { '0%': { transform: 'scale(0.8)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        duration: '250ms',
        easing: 'cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  variables: { /* ... */ },
}
```

See [Animations](./animations.md) for the full animate API.

## Using raw colors

You can always pass a raw hex/rgba value instead of a variable:

```tsx
<Text color="#ff0000" />
<Container background="rgba(0,0,0,0.5)" />
```

Raw colors are static and don't respond to theme changes.
