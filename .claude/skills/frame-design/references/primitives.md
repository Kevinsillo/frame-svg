---
title: Componentes primitivos
impact: MEDIUM
impactDescription: Page, Stack, Box, Grid, Spacer, Text, Circle, Line e Icon son los bloques de construcción — usarlos bien define la calidad del diseño
type: best-practice
tags: [frame-svg, text, circle, line, icon, stack, box, grid, spacer, primitivos]
---

# Componentes primitivos

**Impact: MEDIUM** - Son los átomos del sistema. No requieren import explícito — están disponibles globalmente en cualquier .frame.

## Task List

- Usar `Text` para todo el contenido textual, con `$text` / `$muted` / `$faint` según jerarquía
- Usar `Circle` para avatares simples o elementos decorativos redondos
- Usar `Line` para separadores horizontales o verticales
- Usar `Icon` combinado con `Text` en stacks horizontales para etiquetas con icono
- Escalar iconos en múltiplos: 12 · 16 · 20 · 24 · 32

## Text

```tsx
<Text fontSize={24} fontWeight="700" color="$text">Heading</Text>
<Text fontSize={13} color="$muted">Subtítulo o descripción</Text>
<Text fontSize={11} color="$faint" textAlign="center">Caption</Text>
```

Jerarquía recomendada: `$text` → primario · `$muted` → secundario · `$faint` → caption/label.

## Circle

```tsx
<Circle size={48} background="$accent" shadow={{ blur: 12, color: 'rgba(56,189,248,0.3)', y: 4 }} />
<Circle size={32} background="$surface" border={{ width: 2, color: '$accent' }} />
```

## Line

```tsx
<Line color="$subtle" />
<Line color="$accent" thickness={2} dash="6 4" />
<Line direction="vertical" thickness={1} color="$subtle" length={40} />
```

Para separar secciones en vertical, `<Line color="$subtle" />` dentro de un Stack vertical ocupa el 100% del ancho automáticamente.

## Icon

```tsx
<Icon name="check"  size={16} color="$success" />
<Icon name="zap"    size={20} color="$accent"  />
<Icon name="shield" size={24} color="$muted"   strokeWidth={1.5} />
```

**Iconos disponibles:**
- Status: `check` · `x` · `info` · `triangle-alert` · `bell`
- Highlights: `star` · `flame` · `zap` · `lightbulb`
- Nav: `arrow-right` · `arrow-left` · `arrow-up` · `arrow-down` · `link`
- Code: `code` · `terminal`
- Files: `file` · `folder`
- Org: `tag` · `package` · `download`
- Security: `shield` · `lock` · `user` · `users` · `clock`

Patrón habitual — icono + texto:

```tsx
<Stack direction="horizontal" gap={8} align="center">
  <Icon name="check" size={16} color="$success" />
  <Text fontSize={14} color="$text">Tarea completada</Text>
</Stack>
```
