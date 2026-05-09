---
title: Modelo de proyecto y estructura de archivos
impact: HIGH
impactDescription: Entender el modelo de archivos evita errores de estructura que impiden el renderizado
type: best-practice
tags: [frame-svg, estructura, imports, page, main]
---

# Modelo de proyecto y estructura de archivos

**Impact: HIGH** - El renderizador solo procesa `src/main.frame`. Un .frame mal ubicado o sin Page no produce salida.

## Task List

- Usar `src/main.frame` como único punto de entrada
- Extraer componentes reutilizables a `src/frames/*.frame`
- Importar siempre con el alias `@/` (apunta a la raíz del proyecto)
- Envolver todo contenido en `<Page>` como raíz
- No tocar nada fuera de `src/`

## Estructura del proyecto

```
frame-svg/
└── src/
    ├── main.frame        ← único archivo renderizado
    └── frames/           ← componentes reutilizables
        ├── header.frame
        └── features.frame
```

Solo trabajas en `src/`. Todo lo demás es internals del framework.

## Page: raíz obligatoria

Cada `main.frame` debe tener un `<Page>` como elemento raíz:

```tsx
import { theme } from '@/themes/theme.ts'

<Page theme={theme} width={560} padding={40} background="$bg">
  <Stack gap={24}>
    {/* contenido */}
  </Stack>
</Page>
```

## Exportar e importar frames

Un frame en `src/frames/` exporta una función:

```tsx
// src/frames/header.frame
export function Header() {
  return (
    <Stack direction="horizontal" gap={14} align="center">
      <Box width={4} height={52} radius={2} background="$accent" />
      <Text fontSize={24} fontWeight="700" color="$text">Mi proyecto</Text>
    </Stack>
  )
}
```

`main.frame` lo importa con el alias `@/`:

```tsx
import { Header } from '@/src/frames/header.frame'
```

## Imports de la librería

```tsx
import { theme }   from '@/themes/theme.ts'          // tema por defecto
// Los componentes (Stack, Box, Text…) son globales — no requieren import
```

Los compound components sí requieren import explícito:

```tsx
import { Card, Avatar, Callout } from 'frame-svg/compound'
```
