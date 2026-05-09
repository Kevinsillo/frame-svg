[← README](../README.md)

# Theme

frame-svg has a built-in theme variable system. Variables are named colors that resolve to different values in dark and light mode.

> 💡 **Did you know?** The output SVG embeds both themes in a single file. Wherever you embed it — a GitHub README, a docs site, any webpage — it automatically matches the user's dark or light preference via `prefers-color-scheme`. No JavaScript, no duplicated files.

## Using variables

Prefix any color prop with `$` to use a variable:

```tsx
<Box background="$surface" border={{ width: 1, color: '$subtle' }}>
  <Text color="$text">Hello</Text>
  <Text color="$muted">Secondary</Text>
</Box>
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

Override variables from your `main.frame` via the `theme` prop on `Page`:

```tsx
<Page width={800} theme={{ theme: { tokens: {
  accent: { dark: '#a78bfa', light: '#7c3aed' },
  bg:     { dark: '#0a0a0f', light: '#fafafa'  },
}}}}>
  {/* your content */}
</Page>
```

Only the variables you specify are overridden — the rest use the defaults.

## Using raw colors

You can always pass a raw hex/rgba value instead of a variable:

```tsx
<Text color="#ff0000" />
<Box background="rgba(0,0,0,0.5)" />
```

Raw colors are static and don't respond to theme changes.
