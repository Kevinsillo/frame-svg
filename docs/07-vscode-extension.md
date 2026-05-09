[← README](../README.md)

# VSCode Extension

The frame-svg VSCode extension adds first-class support for `.frame` files.

## Features

- **Syntax highlighting** — JSX-like syntax colored correctly in `.frame` files
- **Autocomplete** — component names, props, and valid values suggested as you type
- **Bracket matching** — auto-close for `<`, `{`, `(`, `[`
- **Comment toggling** — `Ctrl+/` / `⌘+/` works in `.frame` files

## Installation

```bash
npm run ext:install
```

This copies the extension into `~/.vscode/extensions/frame-svg/`. Restart VSCode after running it.

## How autocomplete works

The extension reads `vscode-extension/schema.json` — a file that describes every component, its props, and their valid types or values.

If you add a new component or change a prop, regenerate the schema:

```bash
npm run schema
```

Then reinstall the extension:

```bash
npm run ext:install
```

## What autocomplete covers

- Component names (`Page`, `Stack`, `Box`, `Card`, ...)
- Prop names for each component
- Enum values (e.g. `direction`, `align`, `variant`, `size`, `status`)
- Variable suggestions for color props (`$bg`, `$surface`, `$accent`, ...)

## Troubleshooting

**Autocomplete not showing up** — make sure the file has a `.frame` extension and that you restarted VSCode after installation.

**Schema is out of date** — run `npm run schema && npm run ext:install` and restart VSCode.
