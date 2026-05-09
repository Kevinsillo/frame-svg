[← README](../README.md)

# Layout

frame-svg uses a flexbox-inspired layout model. You nest components and the engine computes positions automatically.

## The box model

Every component has `padding` (inner spacing) and `margin` (outer spacing). Both accept the same shorthand as CSS:

```tsx
padding={16}           // all sides
padding="16 24"        // vertical horizontal
padding="8 12 16 24"   // top right bottom left
```

## Width and height

By default, components shrink to fit their content. Use `width` to set a fixed size:

```tsx
<Box width={200} height={80} />
<Box width="100%" />          // fills parent
<Box width="fit-content" />   // shrinks to children
```

`height` only accepts numbers (no percentages).

## Stack — the main layout tool

`Stack` arranges children either vertically (default) or horizontally.

```tsx
<Stack gap={16}>
  <Text>One</Text>
  <Text>Two</Text>
  <Text>Three</Text>
</Stack>

<Stack direction="horizontal" gap={12}>
  <Box width={40} height={40} background="$accent" />
  <Text>Label</Text>
</Stack>
```

### Alignment

```tsx
<Stack direction="horizontal" align="center" justify="space-between">
  <Text>Left</Text>
  <Text>Right</Text>
</Stack>
```

| Prop | Values | Controls |
|------|--------|----------|
| `align` | `start` · `center` · `end` · `stretch` | Cross axis |
| `justify` | `start` · `center` · `end` · `space-between` | Main axis |

## Grid — equal columns

```tsx
<Grid columns={3} gap={12}>
  <Box background="$surface" radius={8} padding={16}>...</Box>
  <Box background="$surface" radius={8} padding={16}>...</Box>
  <Box background="$surface" radius={8} padding={16}>...</Box>
</Grid>
```

Use `columnGap` and `rowGap` to control spacing independently.

## Spacer — explicit gaps

```tsx
<Stack>
  <Text>Top</Text>
  <Spacer size={32} />
  <Text>Bottom</Text>
</Stack>
```

## Page — the root

Every frame must have a `Page` as root. It sets the SVG width and overall padding.

```tsx
<Page width={800} padding={40} background="$bg">
  {/* content */}
</Page>
```
