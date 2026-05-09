---
title: Componentes compound — listos para usar
impact: MEDIUM
impactDescription: Los compound reducen código repetitivo y garantizan consistencia visual en patrones habituales
type: best-practice
tags: [frame-svg, compound, card, avatar, callout, filetree, stat, keycombo]
---

# Componentes compound — listos para usar

**Impact: MEDIUM** - Prefiere compound sobre primitivos cuando el patrón encaja. Ahorra código y garantiza coherencia.

## Task List

- Importar siempre desde `frame-svg/compound`
- Preferir `Card` sobre un `Box` manual para contenido con título + badge + body
- Preferir `Stat` sobre composición manual para métricas con tendencia
- Usar `Callout` para notas, tips, warnings e importants
- Combinar `Stat` con `<Grid columns={3}>` para dashboards de métricas

## Import

```tsx
import { Card, Avatar, Callout, FeatureList, FileTree, KeyCombo, Stat } from 'frame-svg/compound'
```

## Card

Contenido con título, body, badge opcional y avatar:

```tsx
<Card title="MVP" body="Primera versión enviada a early adopters."
  badge="Active" badgeVariant="accent" avatar="M" divider={true}
  border={{ width: 1.5, color: '$accent' }}
  shadow={{ blur: 8, color: '#00000040', y: 2 }} />
```

`badgeVariant`: `accent` · `success` · `warning` · `danger` · `neutral`

## Avatar

Initiales o emoji con indicador de estado opcional:

```tsx
<Avatar label="KW" size="lg" status="online" />
<Avatar label="🦊" size="lg" background="$warningBg" color="$warning" />
```

`size`: `xs` · `sm` · `md` · `lg` · `xl` — `status`: `online` · `busy` · `away` · `offline`

## Callout

Bloque destacado con icono y fondo coloreado:

```tsx
<Callout variant="tip"       message="Usa --watch para hot reload." />
<Callout variant="warning"   message="Esta acción reinicia todas las conexiones." />
<Callout variant="important" message="Haz backup antes de migrar." />
```

`variant`: `note` · `tip` · `warning` · `important`

## FeatureList

Lista de características con marcadores ✓ / ✗ / •:

```tsx
<FeatureList items={[
  { label: 'Zero dependencies', checked: true  },
  { label: 'Dark & light mode', checked: true  },
  { label: 'Plugin system',     checked: false, description: 'Próximamente' },
]} />
```

## FileTree

Árbol de directorios con highlights y comentarios inline:

```tsx
<FileTree root="src" items={[
  { name: 'main.frame',  type: 'file', depth: 0, highlight: true, comment: '← entry point' },
  { name: 'frames',      type: 'dir',  depth: 0 },
  { name: 'header.frame',type: 'file', depth: 1 },
]} />
```

## KeyCombo

Atajos de teclado como key caps:

```tsx
<KeyCombo keys={['Ctrl', 'Shift', 'P']} />
<KeyCombo keys={['⌘', 'K']} />
```

## Stat

Métrica con label y tendencia — ideal en grids de 3:

```tsx
<Grid columns={3} gap={12}>
  <Stat value="98.2%" label="Uptime"     trend="↑ +0.4% este mes"   trendUp={true} />
  <Stat value="1.4M"  label="Descargas"  trend="↑ +23k esta semana" trendUp={true} icon="📦" />
  <Stat value="12ms"  label="Respuesta"  trend="↓ -3ms vs semana anterior" trendUp={true} />
</Grid>
```
