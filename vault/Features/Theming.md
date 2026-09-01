---
tags: [feature, frontend, design]
---

# Theming

Three states — **system** (default), **light**, **dark** — persisted until the
user changes it.

`client/src/context/theme-provider.tsx`,
`client/src/components/theme-toggle.tsx`,
`client/src/index.css`.

## How it works

Tailwind is configured `darkMode: ["class"]`, so the whole system is: put
`.dark` on `<html>` or don't.

- The stored preference is one of `system | light | dark` in `localStorage`
- `system` resolves through `matchMedia("(prefers-color-scheme: dark)")` and
  **keeps listening**, so changing the OS theme updates a `system` user live
- `resolvedTheme` (always `light` or `dark`) is what components read — the
  charts in [[Dashboards]] use it to pick a palette

## The FOUC guard

An inline script in `index.html` applies the class **before first paint**.
Without it, every dark-mode user gets a white flash on load, because React has
not mounted yet when the browser paints.

Keep it inline and keep it in `<head>` — moving it to a module defeats it.

## Tokens

HSL triples as CSS custom properties, so Tailwind can compose opacity
(`bg-card/50`). Light values live on bare `:root`, dark values under `.dark`.

```css
:root {
  --background: 220 20% 98%;   /* page  */
  --card:         0  0% 100%;  /* cards lift off the page */
  --foreground: 220 18% 16%;   /* cool near-black, not #171717 */
  --muted-foreground: 220 10% 44%;
  --border: 220 14% 90%;
  --input:  220 14% 86%;       /* darker than borders so fields read as fields */
}
```

Everything carries a **hue-220 bias** — surfaces are slightly cool rather than
pure grey, which is what makes the light theme feel calm instead of glaring.

The ramp was deliberately softened after "dark is so dark and light is so
light": the light page sits at 98% rather than pure white, and the dark page at
`#181b20` with cards at `#1f2229` rather than near-black.

## Rules

> [!warning] Never define a colour only inside a `.dark` block
> Every token needs a light definition on bare `:root`. A token that exists only
> in one theme renders as nothing in the other.

> [!warning] Give surfaces explicit backgrounds
> A transparent panel borrows whatever is behind it. The auth split panel was
> once pinned to `bg-primary` and ignored the theme entirely — it is `bg-card` /
> `bg-background` now so both halves follow.

## Related

- [[Design System]] · [[Frontend]] · [[Dashboards]]
