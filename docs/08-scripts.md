[← README](../README.md)

# Scripts

All scripts run from the `frame-svg/` directory.

## `npm run dev`

Starts the Vite dev server with live preview at `localhost:5173`.

Watches `src/main.frame` and all imported component files. Save → instant update in the browser. Includes a dark/light toggle button to check both themes.

## `npm run render`

Renders `src/main.frame` → `dist/main.svg`.

```bash
npm run render
# ✓  dist/main.svg
```

The output SVG has both dark and light themes embedded. It switches automatically via `prefers-color-scheme` when embedded in a webpage or viewed in a browser.

## `npm run render:img`

Renders `src/main.frame` → `dist/main.<format>` as a static raster image using [sharp](https://sharp.pixelplumbing.com).

```bash
npm run render:img                  # → dist/main.webp  (light theme)
npm run render:img png              # → dist/main.png   (light theme)
npm run render:img webp dark        # → dist/main.webp  (dark theme)
npm run render:img jpeg light       # → dist/main.jpeg  (light theme)
```

Supported formats: `webp`, `png`, `jpeg`, `avif`, `gif`, `tiff`, `heif`.  
Supported themes: `light` (default), `dark`.

> **Note:** The theme must be chosen at render time — raster images are static and cannot adapt to the user's system preference the way the SVG output does. For documentation and GitHub READMEs, `npm run render` (SVG) is almost always the better choice.

## `npm run schema`

Introspects all components and generates `vscode-extension/schema.json`.

Run this after adding or modifying a component so that VSCode autocomplete stays accurate.

```bash
npm run schema
```

## `npm run ext:install`

Installs the VSCode extension locally by copying files to `~/.vscode/extensions/frame-svg/`.

```bash
npm run ext:install
```

Restart VSCode after running this. See [VSCode Extension](./07-vscode-extension.md) for details.

## Typical workflow

```bash
# 1. Work interactively
npm run dev

# 2. Export the final SVG
npm run render

# 3. Find the output
ls dist/main.svg
```
