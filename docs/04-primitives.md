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

By default, components shrink to fit their content. Use `width` to control sizing:

```tsx
<Box width={200} />           // fixed
<Box width="100%" />          // fills parent
<Box width="fit-content" />   // shrinks to children
```

`height` only accepts numbers (no percentages).

---

## Page

The root of every frame. Sets the SVG canvas width and background.

```tsx
<Page width={800} padding={40} background="$bg">
  {/* content */}
</Page>
```

| Prop | Type | Description |
|------|------|-------------|
| `width` | `number \| string` | Canvas width in px |
| `padding` | `SpacingValue` | Inner padding |
| `background` | `string \| Gradient` | Background color, variable, or gradient |
| `theme` | `RenderOptions` | Variable overrides — see [Theme](./03-theme.md) |

---

## Stack

Arranges children vertically (default) or horizontally with a gap.

```tsx
<Stack gap={16}>
  <Text>One</Text>
  <Text>Two</Text>
</Stack>

<Stack direction="horizontal" gap={12} align="center" justify="space-between">
  <Text>Left</Text>
  <Text>Right</Text>
</Stack>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout axis |
| `gap` | `number` | `0` | Space between children |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'start'` | Cross-axis alignment |
| `justify` | `'start' \| 'center' \| 'end' \| 'space-between'` | `'start'` | Main-axis alignment |
| `padding` | `SpacingValue` | — | Inner padding |
| `margin` | `SpacingValue` | — | Outer margin |
| `background` | `string \| Gradient` | — | Background |
| `radius` | `number` | — | Border radius |
| `border` | `BorderProps` | — | Border |
| `shadow` | `Shadow` | — | Drop shadow |
| `width` | `number \| string` | — | Fixed width |
| `height` | `number` | — | Fixed height |

---

## Box

A single container. Like Stack but without flex children logic — use it for a single child or a styled wrapper.

```tsx
<Box background="$surface" radius={12} padding={20} shadow={{ blur: 16, color: '#00000030', y: 4 }}>
  <Text color="$text">Content</Text>
</Box>
```

| Prop | Type | Description |
|------|------|-------------|
| `padding` | `SpacingValue` | Inner padding |
| `margin` | `SpacingValue` | Outer margin |
| `background` | `string \| Gradient` | Background |
| `radius` | `number` | Border radius |
| `border` | `BorderProps` | Border — `{ width, color }` |
| `shadow` | `Shadow` | Drop shadow — `{ x?, y?, blur?, color? }` |
| `width` | `number \| string` | Fixed width or `'fit-content'` |
| `height` | `number` | Fixed height |
| `opacity` | `number` | `0`–`1` |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | Content alignment |

---

## Grid

Lays out children in equal-width columns.

```tsx
<Grid columns={3} gap={12} padding={16}>
  <Box background="$surface" radius={8} padding={12}>...</Box>
  <Box background="$surface" radius={8} padding={12}>...</Box>
  <Box background="$surface" radius={8} padding={12}>...</Box>
</Grid>
```

Use `columnGap` and `rowGap` to control spacing independently.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `number` | — | Number of columns (required) |
| `gap` | `number` | `0` | Gap between all cells |
| `columnGap` | `number` | — | Horizontal gap only |
| `rowGap` | `number` | — | Vertical gap only |
| `padding` | `SpacingValue` | — | Inner padding |
| `background` | `string \| Gradient` | — | Background |
| `radius` | `number` | — | Border radius |
| `border` | `BorderProps` | — | Border |
| `shadow` | `Shadow` | — | Drop shadow |

---

## Spacer

Adds explicit blank space between siblings.

```tsx
<Stack>
  <Text>Top</Text>
  <Spacer size={32} />
  <Text>Bottom</Text>
</Stack>
```

| Prop | Type | Description |
|------|------|-------------|
| `size` | `number` | Height (vertical stack) or width (horizontal stack) |
| `width` | `number \| string` | Explicit width override |
| `height` | `number` | Explicit height override |

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
| `length` | `number \| string` | `'100%'` | Line length (`'100%'` or px). Required for vertical. |
| `dash` | `string` | — | Dash pattern, e.g. `'6 4'` |
| `margin` | `SpacingValue` | — | Outer margin |
