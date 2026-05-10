[← README](../README.md)

# Animations

frame-svg supports CSS `@keyframes` animations via the `animate` prop. Every primitive and compound component accepts it. Animations are embedded directly in the SVG's `<style>` block — no JavaScript, no SMIL.

> GitHub blocks SMIL animations for security reasons. frame-svg uses CSS animations instead, which render correctly on GitHub READMEs and documentation sites.

## Quick start

```tsx
// Use a named preset defined in theme.animation.presets
<Circle size={40} background="$accent" animate="pulse" />

// Or define keyframes inline
<Container animate={{ keyframes: { '0%': { opacity: 0 }, '100%': { opacity: 1 } }, duration: '400ms' }}>
  <Text>Fades in</Text>
</Container>
```

## The `animate` prop

Accepts either a preset name (string) or an `AnimateProp` object:

```ts
type Animate = string | AnimateProp

interface AnimateProp {
  preset?    : string                  // name of a preset from theme.animation.presets
  keyframes? : AnimationKeyframes      // inline keyframes (overrides preset keyframes)
  duration?  : string                  // e.g. '300ms', '1s'
  easing?    : string                  // e.g. 'ease-out', 'cubic-bezier(...)'
  delay?     : string                  // e.g. '100ms'
  iteration? : string | number         // e.g. 'infinite', 3
}

type AnimationKeyframes = Record<string, Record<string, string | number>>
// e.g. { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } }
```

## Presets

Named presets are defined in `theme.animation.presets` and referenced by name in the `animate` prop. You can override any timing field at call site.

```tsx
// theme.ts
animation: {
  presets: {
    fadeUp: {
      keyframes: {
        '0%':   { opacity: 0, transform: 'translateY(8px)' },
        '100%': { opacity: 1, transform: 'translateY(0)'   },
      },
      duration: '300ms',
      easing: 'ease-out',
    },
    pulse: {
      keyframes: {
        '0%, 100%': { opacity: 1 },
        '50%':      { opacity: 0.4 },
      },
      duration: '1.5s',
      iteration: 'infinite',
    },
  },
}

// In a .frame file — use by name
<Text animate="fadeUp" fontSize={18} color="$text">Slides in</Text>

// Override duration at call site
<Text animate={{ preset: 'fadeUp', duration: '600ms' }} fontSize={18} color="$text">Slower</Text>
```

## Duration and easing tokens

`theme.animation.duration` and `theme.animation.easing` define shorthand tokens you can reference in `AnimateProp`:

```ts
animation: {
  duration: { fast: '150ms', base: '300ms', slow: '600ms' },
  easing:   { default: 'ease-out', bounce: 'cubic-bezier(0.34,1.56,0.64,1)', linear: 'linear' },
}
```

## Inline keyframes (no preset)

```tsx
<Container
  background="$surface"
  radius={12}
  padding={24}
  animate={{
    keyframes: {
      '0%':   { transform: 'scale(0.95)', opacity: 0 },
      '100%': { transform: 'scale(1)',    opacity: 1 },
    },
    duration: '200ms',
    easing: 'ease-out',
  }}
>
  <Text color="$text">Pops in</Text>
</Container>
```

## Staggered children

Combine `animate` with `delay` to stagger entrance animations:

```tsx
{['One', 'Two', 'Three'].map((label, i) => (
  <Container
    key={i}
    animate={{ preset: 'fadeUp', delay: `${i * 80}ms` }}
    background="$surface"
    radius={8}
    padding={16}
  >
    <Text color="$text">{label}</Text>
  </Container>
))}
```

## Full theme.animation type

```ts
interface AnimationTokens {
  duration?: { fast?: string; base?: string; slow?: string }
  easing?:   { default?: string; bounce?: string; linear?: string }
  presets?:  Record<string, AnimationPreset>
}

interface AnimationPreset {
  keyframes:  AnimationKeyframes
  duration?:  string
  easing?:    string
  delay?:     string
  iteration?: string | number
}
```
