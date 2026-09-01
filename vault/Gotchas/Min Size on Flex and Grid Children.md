---
tags: [gotcha, frontend, css]
---

# Min Size on Flex and Grid Children

## Symptom

Two shapes, same root cause:

- A member row's role button sits **off screen at 320px**. The row measures
  473px inside a 296px column and refuses to shrink.
- A dialog body **does not scroll**; instead the whole dialog grows past the
  viewport and the submit button becomes unreachable.

## Cause

Flex and grid items both default to `min-width: auto` / `min-height: auto`,
which means *"never shrink below the content's intrinsic minimum size"*. Long
unbreakable text, a table, or a tall column will therefore blow out its
container rather than shrink or scroll.

## Fix

`min-w-0` on the flex/grid child for horizontal, `min-h-0` for vertical.

```tsx
{/* the SCROLLING child needs min-h-0, not just its parent */}
<div className="flex min-h-0 flex-1 flex-col">
  <header className="shrink-0">…</header>
  <div className="min-h-0 flex-1 overflow-y-auto">…</div>
</div>
```

## The part that is easy to get wrong

**It goes on the item that is overflowing, not the one that looks wrong.**

For the member row, `min-w-0` on the left-hand side of the row did nothing — the
row itself was a **grid item**, and grid items have the same `auto` minimum. The
fix had to go on the row.

Walk up from the overflowing element and put `min-w-0` on the first flex or grid
child you hit.

## Debugging it

Measure rather than guess. Walk the ancestor chain from the offending element
and print, for each: `x`, `width`, `right`, `display`, `flex-shrink`,
`min-width`, `overflow-x`. The culprit is the first ancestor whose `min-width`
is `auto` and whose child is wider than it is. The
[[Verification Harness]] responsive sweep has this built in.

## Related

- [[Design System]] · [[Frontend]] · [[Verification Harness]]
