[← README](../README.md)

# Compound Components

Compound components are pre-built, opinionated blocks built on top of primitives. Import them from `frame-svg/compounds`.

---

## Card

A content card with title, body, optional badge, avatar, and divider.

```tsx
<Card
  title="MVP"
  body="First usable version shipped to early adopters."
  badge="Active"
  badgeVariant="accent"
  avatar="M"
  divider={true}
  border={{ width: 1.5, color: '$accent' }}
  shadow={{ blur: 8, color: '#00000040', y: 2 }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Card heading |
| `body` | `string` | — | Body text |
| `badge` | `string` | — | Badge label |
| `badgeVariant` | `'accent' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `'neutral'` | Badge color |
| `avatar` | `string` | — | Single-character avatar shown next to title |
| `divider` | `boolean` | `false` | Horizontal line between header and body |
| `border` | `BorderProps` | — | Card border |
| `shadow` | `Shadow` | — | Drop shadow |

---

## Avatar

User avatar with initials or emoji and an optional status dot.

```tsx
<Avatar label="KW" size="md" />
<Avatar label="KW" size="lg" status="online" />
<Avatar label="🦊" size="lg" background="$warningBg" color="$warning" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Initials or emoji (required) |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Avatar size |
| `status` | `'online' \| 'busy' \| 'away' \| 'offline'` | — | Status indicator dot |
| `background` | `string` | `'$accent'` | Background color or variable |
| `color` | `string` | `'$surface'` | Text color or variable |

---

## Callout

Highlights important information with an icon and a colored background.

```tsx
<Callout variant="note"      message="Requires Node.js 18 or higher." />
<Callout variant="tip"       message="Use --watch to enable hot reload." />
<Callout variant="warning"   message="This action restarts all connections." />
<Callout variant="important" message="Back up your data before migrating." />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'note' \| 'tip' \| 'warning' \| 'important'` | `'note'` | Visual style and icon |
| `message` | `string` | — | Body text |
| `width` | `number \| string` | `'100%'` | Container width |
| `margin` | `SpacingValue` | — | Outer margin |

---

## FeatureList

A list of features with check, cross, or dot markers and optional descriptions.

```tsx
<FeatureList items={[
  { label: 'Zero dependencies', checked: true  },
  { label: 'Dark & light mode', checked: true  },
  { label: 'IE11 support',      checked: false },
  { label: 'Plugin system',     checked: false, description: 'Coming soon' },
]} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FeatureItem[]` | — | List of items |
| `width` | `number \| string` | `'100%'` | Container width |
| `gap` | `number` | `10` | Gap between rows |

`FeatureItem` — `label: string` · `checked?: boolean` (true = ✓, false = ✗, omit = •) · `description?: string`

---

## FileTree

Renders a directory structure with optional highlights and inline comments.

```tsx
<FileTree
  root="my-project"
  items={[
    { name: 'src',          type: 'dir',  depth: 0 },
    { name: 'index.ts',     type: 'file', depth: 1, highlight: true, comment: '← entry point' },
    { name: 'app.ts',       type: 'file', depth: 1 },
    { name: 'package.json', type: 'file', depth: 0 },
  ]}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `items` | `FileTreeItem[]` | Files and directories (required) |
| `root` | `string` | Optional root folder label |
| `width` | `number \| string` | Container width |

`FileTreeItem` — `name` · `type: 'file' | 'dir'` · `depth: number` · `highlight?: boolean` · `comment?: string`

---

## KeyCombo

Renders a keyboard shortcut as styled key caps.

```tsx
<KeyCombo keys={['Ctrl', 'K']} />
<KeyCombo keys={['⌘', '⇧', 'P']} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `keys` | `string[]` | — | Key labels in order (required) |
| `gap` | `number` | `6` | Gap between caps |

---

## Stat

A metric card with value, label, and an optional trend indicator.

```tsx
<Stat value="98.2%" label="Uptime"    trend="↑ +0.4% this month" trendUp={true} />
<Stat value="1.4M"  label="Downloads" trend="↑ +23k this week"    trendUp={true} icon="📦" />
<Stat value="$84k"  label="MRR"       trend="↓ -2.1% vs last month" trendUp={false} />
```

Tip: wrap multiple stats in `<Grid columns={3} gap={12}>` for a dashboard row.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Main metric (required) |
| `label` | `string` | Metric label (required) |
| `trend` | `string` | Trend line text |
| `trendUp` | `boolean` | `true` = green, `false` = red |
| `icon` | `string` | Optional emoji shown next to value |
