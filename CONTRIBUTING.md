# Contributing to frame-svg

Thanks for your interest in contributing. To keep things focused and avoid wasted effort, all contributions follow a two-step process: **issue first, code second**.

## Step 1 — Open an issue

Before writing any code, open an issue using the appropriate template:

- **Bug fix** — use the [Bug fix](.github/ISSUE_TEMPLATE/bug_fix.md) template: description, steps to reproduce, expected vs actual behavior, and a minimal `.frame` file that triggers the bug.
- **New component** — use the [Community component](.github/ISSUE_TEMPLATE/new_component.md) template: name, purpose, props table, which primitives it builds on, and a `.frame` file placed in `src/frames/` so maintainers can render and review it.

Wait for a maintainer to approve the issue. If the proposal is accepted, you'll get a green light to proceed. This protects your time — no one wants to spend hours on a PR that won't be merged.

## Step 2 — Make the change and open a pull request

Once your issue is approved:

1. Fork the repository and create a branch from `main`.
2. Make the change.
3. Open a pull request that references the issue (e.g. `Closes #42`).

Keep the PR scoped to what was discussed in the issue. PRs that expand beyond the approved scope will be asked to split.

---

## What you can contribute

### Bug fixes

Any bug with a reproducible case is fair game. Open an issue first, include steps to reproduce, and reference it in your PR.

### Community components

Community contributions can be new primitives or new compound components. Both live under:

```
frame-svg/components/community/
```

**Community primitives** are new layout nodes at the same level as `Stack`, `Box`, `Text`, etc. They must render directly to SVG elements with no dependency on other components.

**Community compounds** are higher-level, opinionated components built from primitives. Rules for compounds:

- Built exclusively from frame-svg primitives (`Stack`, `Box`, `Text`, `Circle`, `Line`, `Grid`, `Spacer`, `Icon`) — wrapping existing compound components is not allowed. Compounds wrapping compounds create overlapping responsibilities and unnecessary coupling.
- Has a single clear purpose that isn't already covered by an existing compound.
- Accepts props that follow the existing naming conventions (`color`, `fontSize`, `gap`, etc.).
- Works correctly with the theme variable system (`$accent`, `$text`, `$surface`, …).

Community components are not promoted to the core library automatically. Over time, widely-used and well-maintained ones may be considered for promotion.

---

## Code style

- TypeScript, strict mode.
- No comments unless the reason is non-obvious.
- Match the naming and structure of existing components.

---

## Credits

Accepted contributors are added to the [Credits](README.md#credits) section of the README. The entry includes your name (or handle) and what you contributed.
