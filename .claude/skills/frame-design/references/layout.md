---
title: Componentes de layout estructural
impact: HIGH
impactDescription: Stack, Grid y Box son la base de cualquier composición — usarlos correctamente define la legibilidad y el ritmo visual
type: best-practice
tags: [frame-svg, layout, stack, grid, box, spacer]
---

# Componentes de layout estructural

**Impact: HIGH** - El motor de layout es flexbox-inspired. Anidar Stack y Grid correctamente define el ritmo visual del diseño.

## Task List

- Usar `Stack` para secuencias verticales u horizontales con gap uniforme
- Usar `Grid` para cuadrículas de columnas iguales
- Usar `Box` como contenedor con estilo para un solo hijo o contenido inline
- Usar `Spacer` para añadir espacio puntual entre elementos
- Aplicar el shorthand de spacing igual que CSS

## Stack — el componente principal

Organiza hijos en vertical (por defecto) u horizontal:

```tsx
<Stack gap={16}>
  <Text>Primero</Text>
  <Text>Segundo</Text>
</Stack>

<Stack direction="horizontal" gap={12} align="center" justify="space-between">
  <Text fontWeight="700" color="$text">Título</Text>
  <Icon name="arrow-right" size={16} color="$muted" />
</Stack>
```

| `align` | `justify` |
|---------|-----------|
| `start` · `center` · `end` · `stretch` | `start` · `center` · `end` · `space-between` |

Stack también acepta `background`, `radius`, `border`, `shadow`, `padding`, `width`.

## Grid — columnas iguales

```tsx
<Grid columns={3} gap={12}>
  <Box background="$surface" radius={8} padding={16}>...</Box>
  <Box background="$surface" radius={8} padding={16}>...</Box>
  <Box background="$surface" radius={8} padding={16}>...</Box>
</Grid>
```

Usa `columnGap` y `rowGap` para controlar los ejes por separado.

## Box — contenedor con estilo

Úsalo cuando necesitas fondo, borde, sombra o radio sin hijos múltiples:

```tsx
<Box background="$surface" radius={12} padding={20}
  border={{ width: 1, color: '$subtle' }}
  shadow={{ blur: 16, color: '#00000030', y: 4 }}>
  <Text color="$text">Contenido</Text>
</Box>
```

`width="fit-content"` reduce el box al tamaño de su contenido (útil para badges).

## Spacer — espacio puntual

```tsx
<Stack>
  <Text>Sección A</Text>
  <Spacer size={32} />
  <Text>Sección B</Text>
</Stack>
```

## Shorthand de spacing

```tsx
padding={16}          // todos los lados
padding="16 24"       // vertical horizontal
padding="8 12 16 24"  // top right bottom left
margin="4 0 0 0"      // solo top
```
