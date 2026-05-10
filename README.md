<div align="center">

# frame-svg

***SVG layout engine for code-first documentation — primitives, themes, and compound components, zero dependencies.***

</div>

![frame-svg showcase](resources/readme.svg)

frame-svg renders structured SVGs directly from TypeScript. It uses a JSX-like `.frame` syntax, a flexbox-inspired layout engine, and a theme variable system.

**The output is a single `.svg` file that adapts to the user's theme automatically** — dark mode users see dark colors, light mode users see light colors, with no JavaScript and no duplicated files. Embed it anywhere: GitHub READMEs, documentation sites, or any webpage, and it just works.

## How it works

Write a `.frame` file with layout primitives and compound components. Run the renderer. Get an SVG.

The layout engine resolves sizes in a single deterministic pass — no DOM, no browser. Theme variables (`$accent`, `$surface`, `$text`, …) become CSS classes in the SVG output, so GitHub renders the correct colors for each user's system preference.

## Core concepts

| Term | Meaning |
|------|---------|
| `.frame` file | A TypeScript/JSX file with `.frame` extension — auto-imports all primitives and compound components |
| Primitive | A layout node: `Template`, `Container`, `Text`, `Circle`, `Line`, `Spacer`, `Icon` |
| Compound component | A higher-level component built from primitives: `Card`, `Avatar`, `Callout`, `FeatureList`, `FileTree`, `KeyCombo`, `Stat` |
| Theme variable | A `$name` string in any color prop that resolves to a CSS class with dark/light values |
| Template | The document root — injects theme, fonts, and animation tokens |
| Container | The universal layout box — vertical stack, horizontal row, or grid |

## Quick install

```bash
npm install frame-svg
```

## Quick start

1. Create `src/main.frame`:

```tsx
<Template theme={theme}>
  <Container gap={16} padding={36} background="$bg">
    <Text fontSize={24} fontWeight="700" color="$text">Hello, frame-svg</Text>
    <Callout variant="tip" message="This renders as an SVG." />
  </Container>
</Template>
```

2. Start the dev server to preview with hot reload:

```bash
npm run dev
```

Opens `localhost:5173` in your browser. Save any `.frame` file and the preview updates instantly. Includes a dark/light toggle to check both themes.

3. When you're happy with the result, export the final SVG:

```bash
npm run render
```

4. The rendered SVG is generated in `dist/`. Embed it wherever you need it.

## Documentation

| | |
|---|---|
| [Getting Started](docs/getting-started.md) | Installation, first render, project structure |
| [Primitives](docs/primitives.md) | Template, Container, Text, Circle, Line, Spacer, Icon |
| [Compound Components](docs/compound.md) | Card, Avatar, Callout, FeatureList, FileTree, KeyCombo, Stat |
| [Icons](docs/icons.md) | Built-in icon set and custom paths |
| [Theme](docs/theme.md) | Variables, dark/light mode, customization |
| [Animations](docs/animations.md) | The `animate` prop, presets, and keyframes |
| [Scripts](docs/scripts.md) | dev, render, render:img, schema, ext:install |
| [Examples](docs/examples.md) | Visual reference with SVG previews |
| [Internals](docs/internals.md) | Pipeline, primitives registry, renderer |
| [VS Code Extension](docs/vscode-extension.md) | Syntax highlighting and autocomplete |
| [Philosophy](docs/philosophy.md) | The .frame model, design rationale |
| [AI Skill](docs/ai-skill.md) | Claude Code skill for designing with frame-svg |

## VS Code

Install [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) to get an SVG icon for `.frame` files. The setting is already included in `.vscode/settings.json`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full process — issue first, code second.

## Credits

Contributions are recognized here. If your pull request is merged, your name or handle and what you contributed will be listed below.

| Contributor | Contribution |
|-------------|-------------|
| — | — |

## License

[MIT](LICENSE)
