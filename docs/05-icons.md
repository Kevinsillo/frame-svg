[← README](../README.md)

# Icons

Built-in stroke-based icons. 24×24 viewBox, scales cleanly to any size.

## Usage

```tsx
<Icon name="star"   size={20} color="$accent" />
<Icon name="shield" size={24} color="$success" />
<Icon name="zap"    size={16} color="$warning" strokeWidth={1.5} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `IconName` | — | Icon identifier (required) |
| `size` | `number` | `20` | Width and height in px |
| `color` | `string` | `'$text'` | Stroke color or variable |
| `strokeWidth` | `number` | `2` | Stroke weight |
| `margin` | `SpacingValue` | — | Outer spacing |

## Available icons

**Status & feedback**
`check` · `x` · `info` · `triangle-alert` · `bell`

**Brand & highlights**
`star` · `flame` · `zap` · `lightbulb`

**Navigation**
`arrow-right` · `arrow-left` · `arrow-up` · `arrow-down` · `link`

**Actions**
`download`

**Code & terminal**
`code` · `terminal`

**Files**
`file` · `folder`

**Organization**
`tag` · `package`

**Security & users**
`shield` · `lock` · `user` · `users`

**Time**
`clock`

## Combining with text

```tsx
<Stack direction="horizontal" gap={8} align="center">
  <Icon name="check" size={16} color="$success" />
  <Text fontSize={14} color="$text">Task complete</Text>
</Stack>
```

## In a badge

```tsx
<Box width="fit-content" background="$accentBg" radius={6} padding="5 10">
  <Stack direction="horizontal" gap={6} align="center">
    <Icon name="zap" size={12} color="$accent" />
    <Text fontSize={12} fontWeight="600" color="$accent">New</Text>
  </Stack>
</Box>
```
