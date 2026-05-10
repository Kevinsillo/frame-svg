[← README](../README.md)

# Primitives

Primitives are the building blocks. Every layout in frame-svg is composed from these.

## Layout model

Every component has `padding` (inner spacing) and `margin` (outer spacing). Both accept the same shorthand as CSS:

```tsx
padding={16}           // all sides
padding="16 24"        // vertical horizontal
padding="8 12 16 24"   // top right bottom left
```

### Sizing keywords

`width`, `height`, and `length` (Line) accept numbers or the following strings:

| Value | Meaning | `width` | `height` |
|---|---|:---:|:---:|
| `number` | Fixed pixels | ✓ | ✓ |
| `"full"` | Fill available space from parent | ✓ | ✓ * |
| `"50%"` / any `"X%"` | Percentage of available space | ✓ | ✓ * |
| `"fit-content"` | Shrink to children | ✓ | — |
| `"auto"` | Same as `"full"` for width | ✓ | — |

> \* Height keywords only resolve when the parent has a **known height** before laying out children. This happens in three cases:
> - Children of a **horizontal container** — the tallest sibling determines the cross-axis height.
> - Children of a **vertical container with an explicit numeric `height`**.
> - Children re-resolved by `align="stretch"` in a horizontal container.
>
> In a content-based vertical container none of the children can declare a percentage height (circular dependency — no one knows the height yet).

```tsx
// width always works
<Container width="full" />
<Container width="50%" />

// height works in a horizontal container (cross-axis is known)
<Container direction="horizontal">
  <Container>
    <Text>Tall content</Text>      {/* drives the row height */}
  </Container>
  <Container height="full">       {/* fills to match the tallest sibling */}
    ...
  </Container>
  <Container height="50%">        {/* half the row height */}
    ...
  </Container>
</Container>

// height works when the parent has an explicit height
<Container height={200}>
  <Container height="full">...</Container>   {/* 200 - padding */}
  <Container height="50%">...</Container>    {/* 100px */}
</Container>
```

---

## Template

The mandatory document root. Carries theme variables, fonts, and animation tokens. Does not produce any SVG output of its own — it delegates size and position entirely to its single child Container.

```tsx
<Template theme={theme}>
  <Container direction="vertical" padding={40} background="$bg">
    {/* content */}
  </Container>
</Template>
```

| Prop | Type | Description |
|------|------|-------------|
| `theme` | `RenderOptions` | Theme variables, fonts, animation tokens — see [Theme](./theme.md) |

---

## Container

The universal layout box. Controls direction, alignment, spacing, and visual styling for a group of children. Covers all use cases previously handled by `Box`, `Stack`, `Page`, and `Grid`.

```tsx
// Vertical stack (default)
<Container gap={16} padding={24} background="$surface" radius={12}>
  <Text>One</Text>
  <Text>Two</Text>
</Container>

// Horizontal row
<Container direction="horizontal" gap={12} align="center" justify="space-between">
  <Text>Left</Text>
  <Text>Right</Text>
</Container>

// Grid
<Container direction="grid" columns={3} gap={12} padding={16}>
  <Container background="$surface" radius={8} padding={12}>...</Container>
  <Container background="$surface" radius={8} padding={12}>...</Container>
  <Container background="$surface" radius={8} padding={12}>...</Container>
</Container>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'vertical' \| 'horizontal' \| 'grid'` | `'vertical'` | Layout axis |
| `columns` | `number` | — | Number of columns (grid only) |
| `gap` | `number` | `0` | Space between children |
| `columnGap` | `number` | — | Horizontal gap only (grid only) |
| `rowGap` | `number` | — | Vertical gap only (grid only) |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Cross-axis alignment |
| `justify` | `'start' \| 'space-between'` | `'start'` | Main-axis distribution |
| `padding` | `SpacingValue` | — | Inner padding |
| `margin` | `SpacingValue` | — | Outer margin |
| `width` | `number \| string` | — | Fixed, `'full'`, `'fit-content'`, `'auto'`, or `'X%'` |
| `height` | `number \| string` | — | Fixed, `'full'`, or `'X%'` — see Sizing keywords above |
| `background` | `string \| Gradient` | — | Background color, variable, or gradient |
| `radius` | `number \| string` | — | Border radius |
| `border` | `BorderProps` | — | Border — `{ width, color }` |
| `shadow` | `Shadow` | — | Drop shadow — `{ x?, y?, blur?, color? }` |
| `opacity` | `number` | — | `0`–`1` |

---

## Text

Renders text with optional font styling.

```tsx
<Text fontSize={24} fontWeight="700" color="$text">Heading</Text>
<Text fontSize={13} color="$muted" textAlign="center">Caption</Text>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fontSize` | `number` | `14` | Font size in px |
| `fontWeight` | `string \| number` | `'400'` | Weight: `400`, `600`, `700`, etc. |
| `fontFamily` | `string` | system-ui | Font family name |
| `color` | `string` | `'$text'` | Color or variable |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment |
| `lineHeight` | `number` | `1.4` | Line height multiplier |
| `padding` | `SpacingValue` | — | Inner padding |
| `margin` | `SpacingValue` | — | Outer margin |

---

## Circle

A filled circle with optional border and shadow.

```tsx
<Circle size={48} background="$accent" shadow={{ blur: 12, color: 'rgba(56,189,248,0.3)', y: 4 }} />
<Circle size={32} background="$surface" border={{ width: 2, color: '$subtle' }} />
```

| Prop | Type | Description |
|------|------|-------------|
| `size` | `number` | Diameter in px (required) |
| `background` | `string \| Gradient` | Fill color or variable |
| `border` | `BorderProps` | Border |
| `shadow` | `Shadow` | Drop shadow |
| `opacity` | `number` | `0`–`1` |
| `margin` | `SpacingValue` | Outer margin |

---

## Line

A horizontal or vertical rule.

```tsx
<Line color="$subtle" />
<Line color="$accent" thickness={2} dash="6 4" />
<Line direction="vertical" thickness={1} color="$subtle" length={40} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Line orientation |
| `color` | `string` | — | Stroke color or variable |
| `thickness` | `number` | `1` | Stroke width in px |
| `length` | `number \| string` | `'full'` | Line length. Accepts px, `'full'`, or `'X%'`. Required for vertical lines. |
| `dash` | `string` | — | Dash pattern, e.g. `'6 4'` |
| `margin` | `SpacingValue` | — | Outer margin |

---

## Spacer

Adds explicit blank space between siblings.

```tsx
<Container direction="vertical">
  <Text>Top</Text>
  <Spacer size={32} />
  <Text>Bottom</Text>
</Container>
```

| Prop | Type | Description |
|------|------|-------------|
| `size` | `number` | Height (vertical) or width (horizontal) |
| `width` | `number \| string` | Explicit width override |
| `height` | `number` | Explicit height override |

---

## Icon

Renders a built-in icon by name, or custom SVG paths. See [Icons](./icons.md) for the full icon catalog.

```tsx
<Icon name="star" size={20} color="$accent" />
<Icon paths={['M12 2l...', 'M6 18...']} size={24} color="$text" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `IconName` | — | Built-in icon identifier |
| `paths` | `string[]` | — | Custom SVG path data (used when `name` is not set) |
| `size` | `number` | `20` | Width and height in px |
| `color` | `string` | `'$text'` | Stroke color or variable |
| `strokeWidth` | `number` | `2` | Stroke weight |
| `margin` | `SpacingValue` | — | Outer spacing |

---

## The `animate` prop

Every primitive accepts an `animate` prop to add CSS animations. See [Animations](./animations.md) for the full API.

```tsx
<Circle size={40} background="$accent" animate="pulse" />
<Container animate={{ keyframes: { '0%': { opacity: 0 }, '100%': { opacity: 1 } }, duration: '400ms' }}>
  <Text>Fades in</Text>
</Container>
```
