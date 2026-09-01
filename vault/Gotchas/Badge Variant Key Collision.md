---
tags: [gotcha, frontend, design]
---

# Badge Variant Key Collision

## Symptom

Adding a `size` column to the task table with colour-coded badges would have
silently repainted **priority** badges, or vice versa.

## Cause

`components/ui/badge.tsx` keys its variants by a flat string map, and two
unrelated enums share member names:

```ts
TaskPriorityEnum.MEDIUM === "MEDIUM"
TaskSizeEnum.MEDIUM     === "MEDIUM"
```

Also `LOW`/`HIGH` vs `SMALL`/`LARGE` are distinct, but `MEDIUM` collides
exactly. A single `variant="MEDIUM"` cannot mean two different colours.

## Fix

Size uses a neutral outline rather than its own colour scale:

```tsx
<Badge variant="outline" className="… text-muted-foreground">
```

Two reasons, and the second is the better one:

1. It sidesteps the collision without namespacing every variant key
2. **Three colour-coded columns in one row is too much.** Status and priority
   already carry colour; a third scale turns the row into noise. Size gets an
   icon and a muted label, which is enough.

## If you do need colour-coded size later

Namespace the keys — `priority-medium`, `size-medium` — and update every call
site. Do not add a bare `MEDIUM`.

## Generalise

> [!tip]
> Any lookup keyed by a bare enum member is a collision waiting to happen the
> moment a second enum shares a name. Prefix the key with its domain, or key on
> a tuple.

## Related

- [[Tasks]] · [[Design System]]
