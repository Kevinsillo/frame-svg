[← README](../README.md)

# AI Skill — frame-design

frame-svg ships a Claude Code skill that helps you design SVG assets using the full potential of the framework.

## What it does

The `frame-design` skill acts as an in-editor design assistant. It knows the complete component API, theme variable system, layout model, and `.frame` file conventions. Ask it to create or edit any asset and it will write correct, theme-aware `.frame` code immediately.

## When it activates

The skill triggers automatically when you:

- Ask for help designing something in frame-svg
- Request a new SVG asset — card, banner, diagram, dashboard, etc.
- Ask to edit or extend an existing `.frame` file
- Ask how to use a specific component or layout pattern

## What it knows

| Reference | Covers |
|-----------|--------|
| File model | Project structure, Page as root, imports with `@/` |
| Theme | `$*` variables, dark/light mode, raw colors |
| Primitives | Page, Stack, Box, Grid, Spacer, Text, Circle, Line, Icon |
| Compound | Card, Avatar, Callout, FeatureList, FileTree, KeyCombo, Stat |

## License

The skill is released under the [MIT License](../LICENSE) — you are free to use, modify, and distribute it. The skill source lives in `.claude/skills/frame-design/`.
