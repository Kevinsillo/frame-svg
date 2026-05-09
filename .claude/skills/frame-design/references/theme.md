---
title: Sistema de tema y variables de color
impact: HIGH
impactDescription: Usar variables en vez de colores raw garantiza soporte automático de dark/light mode
type: best-practice
tags: [frame-svg, tema, colores, dark-mode, variables]
---

# Sistema de tema y variables de color

**Impact: HIGH** - El SVG generado embebe ambos temas en un solo fichero. Usa variables `$*` para que el diseño se adapte automáticamente al modo oscuro o claro del usuario.

## Task List

- Prefija con `$` cualquier prop de color para usar variables de tema
- Usa `$bg` como background de Page, nunca un color raw
- Usa `$surface` para cards y paneles, `$raised` para elementos elevados
- Reserva colores raw solo para gradientes o colores de marca fijos
- Importa `theme` desde `@/themes/theme.ts` y pásalo a `<Page>`

## Variables disponibles

| Variable | Uso |
|----------|-----|
| `$bg` | Fondo de Page |
| `$surface` | Cards, paneles |
| `$raised` | Elementos elevados |
| `$subtle` | Bordes, divisores |
| `$text` | Texto principal |
| `$muted` | Texto secundario |
| `$faint` | Labels, captions |
| `$accent` | Marca, elementos interactivos |
| `$success` | Estados positivos |
| `$warning` | Estados de alerta |
| `$danger` | Errores |
| `$accentBg` | Fondo de badges accent |
| `$successBg` | Fondo de badges success |
| `$warningBg` | Fondo de badges warning |
| `$dangerBg` | Fondo de badges danger |

## Cuándo usar raw colors

Solo para gradientes multi-stop o colores de marca que deben ser exactos y estáticos:

```tsx
background={{ type: 'linear', angle: 135, stops: [
  { offset: 0, color: '#38bdf8' },
  { offset: 1, color: '#818cf8' },
]}}
```

## Personalizar el tema

Sobrescribe variables puntuales en `<Page>` sin tocar el tema base:

```tsx
<Page theme={{ theme: { tokens: {
  accent: { dark: '#a78bfa', light: '#7c3aed' },
}}}} width={560} background="$bg">
```
