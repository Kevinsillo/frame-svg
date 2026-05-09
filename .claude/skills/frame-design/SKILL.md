---
name: frame-design
description: Use when the user needs help creating or editing SVG designs with frame-svg. Activates for requests like "create an SVG asset", "design a card/banner/diagram", "help me with a .frame file", "add a section to my frame", or any task involving .frame files or frame-svg components.
license: MIT
metadata:
  author: Kevin Illanas Cabeza - https://github.com/kevinsillo
  version: 1.0.0
---

# frame-design Workflow

Guides the user through creating and editing SVG assets with the frame-svg framework.

## Workflow

Use this skill as an instruction set. Follow the workflow in order unless the user explicitly asks for a different order.

### 1) Determinar contexto (required)

Before writing any code, clarify:

- **¿Qué quiere crear?** — README card, banner, diagrama, dashboard, asset de documentación, etc.
- **¿Nuevo o existente?** — ¿Crea un .frame desde cero o edita uno existente?
- **¿Qué contenido?** — textos, métricas, estructura de archivos, features, atajos de teclado, etc.

If the user has already provided enough context, skip directly to step 2.

### 2) Cargar references (required)

**Siempre cargar:**
- `references/file-model.md` — Estructura del proyecto, Page como raíz, imports con `@`
- `references/theme.md` — Variables `$*`, dark/light mode, cuándo usar raw colors

**Cargar según el contenido del diseño:**
- `references/layout.md` — Cuando necesita Stack, Grid, Box o Spacer
- `references/primitives.md` — Cuando necesita Text, Circle, Image, Line o Icon
- `references/compound.md` — Cuando necesita Card, Avatar, Callout, FeatureList, FileTree, KeyCombo o Stat

### 3) Diseñar e implementar (required)

Create or edit the `.frame` file(s) applying all loaded references. Follow the design patterns, prefer compound components when they fit, and use theme variables throughout.

### 4) Self-check (required)

- El frame tiene `<Page>` como raíz con `theme` y `background="$bg"`.
- Todos los colores usan variables `$*` salvo excepciones justificadas.
- Los imports usan el alias `@/` y apuntan a las rutas correctas.
- El diseño se verá correcto tanto en dark como en light mode.
