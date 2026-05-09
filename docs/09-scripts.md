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

Restart VSCode after running this. See [VSCode Extension](./08-vscode-extension.md) for details.

## Typical workflow

```bash
# 1. Work interactively
npm run dev

# 2. Export the final SVG
npm run render

# 3. Find the output
ls dist/main.svg
```
