---
tags: [reference, design, frontend]
---

# Design System

Brand: **Meridian**. The mark is a sphere with a meridian arc
(`components/logo/index.tsx`, exporting `MeridianMark` and
`MeridianGraticule`). The graticule is reused as a faint background in dialog
header bands.

> [!tip] Render marks before shipping them
> The first Meridian mark accidentally reproduced the London Underground
> roundel. Nothing caught it except looking at it. See [[Verification Harness]].

## Shared shells

| Component | Use |
|---|---|
| `resuable/page-header.tsx` | Eyebrow + title + description + actions. Every page uses it |
| `resuable/dialog-shell.tsx` | Header band + scrollable body. Exports `OptionalChip` |
| `resuable/pager.tsx` | Server-paginated list controls |
| `resuable/visibility-picker.tsx` | PRIVATE/SHARED + member multi-select ([[Notes]], [[Meetings]]) |
| `resuable/confirm-dialog.tsx` | Destructive confirmation. **Named export, not default** |
| `auth/auth-shell.tsx` | Split layout for sign-in / sign-up |

## Dialog scrolling

Every dialog wrapper uses the same class string:

```tsx
className="!flex max-h-[85dvh] flex-col gap-0 overflow-hidden border-0 !p-0 sm:max-w-[520px]"
```

(560px for task dialogs.) Inside `DialogShell`: the column is
`flex min-h-0 w-full flex-1 flex-col`, the header is `shrink-0`, the body is
`min-h-0 flex-1 overflow-y-auto`.

The `!` prefixes are not decorative — the shadcn base `DialogContent` sets
`grid`, `p-6`, and `overflow-y-auto`, and all three have to be beaten. Getting
this wrong once put the Create Task submit button at y=1016 in an 800px window
with no way to reach it.

`min-h-0` is mandatory on the scrolling child. See
[[Min Size on Flex and Grid Children]].

## Tokens

HSL triples on `:root` / `.dark`, hue-220 bias. Full listing in [[Theming]].

## Responsive

Verified at 320px and 1280px, both themes, on every page — no horizontal
overflow anywhere. Rules that keep it that way:

- `min-w-0` on flex **and** grid children that contain long text
- tables scroll inside their own wrapper, never the page body
- toolbars become horizontally scrollable strips on narrow screens
  (`overflow-x-auto` + the `.no-scrollbar` utility in `index.css`)
- action buttons go full width on mobile, `self-end` on desktop

## Charts

`common/ordinal-bar-chart.tsx` — see [[Dashboards]] for the palettes and the
rules they satisfy.

## Related

- [[Theming]] · [[Frontend]] · [[Verification Harness]]
