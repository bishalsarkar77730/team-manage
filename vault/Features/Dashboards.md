---
tags: [feature, dataviz]
---

# Dashboards

Two of them, deliberately parallel.

## Workspace Dashboard — `/workspace/:id`

`page/workspace/Dashboard.tsx`. Four stat tiles from
`GET /api/workspace/analytics/:id`:

`totalTasks` · `inReviewTasks` · `overdueTasks` · `completedTasks`

Below them, a Recent Activity block with three tabs: Recent Projects, Recent
Tasks, Recent Members.

## My Dashboard — `/workspace/:id/my-dashboard`

`page/workspace/MyDashboard.tsx`. The same four tiles, but scoped to the
signed-in user via `GET /api/task/workspace/:id/my-analytics`, which returns:

```ts
{ totalTasks, overdueTasks, inReviewTasks, completedTasks,
  byStatus: [{ key, count }], byPriority: [{ key, count }] }
```

Two `OrdinalBarChart`s below the tiles, and a Recent Activity section holding
**only** Recent Tasks.

Server side it is two `$group` aggregations plus an overdue count —
`getMyTaskAnalyticsService` in `task.service.ts`.

## The charts

`components/workspace/common/ordinal-bar-chart.tsx`. Horizontal bars, one row
per category, count direct-labelled at the end of each row.

Status and priority are both **ordinal** — `BACKLOG → DONE`, `LOW → HIGH` — so
they get a sequential single-hue ramp, not categorical colours. Light mode runs
light→dark as the ordinal rises; dark mode runs dark→light, which is a
*selected* dark palette, not an automatic inversion.

```ts
const RAMPS = {
  light: { 3: ["#86b6ef","#2a78d6","#184f95"],
           5: ["#86b6ef","#5598e7","#2a78d6","#1c5cab","#104281"] },
  dark:  { 3: ["#256abf","#3987e5","#86b6ef"],
           5: ["#256abf","#3987e5","#6da7ec","#9ec5f4","#cde2fb"] },
};
```

Both ramps were validated for monotone lightness, ΔL ≥ 0.06 between adjacent
steps, single hue, and a light end that still clears 2:1 against the surface.
The set is chosen from `useTheme().resolvedTheme`.

Rules being followed here, worth keeping if you touch it:

- one series → **no legend**; the title names it and categories are labelled in
  text, so identity is never colour-alone
- hovering a bar dims the others; the `title` carries the share percentage
- never a dual axis, never a rainbow for ordered data

## Stat tiles

`analytics-card.tsx`. Label, big number, and a trend arrow whose **semantics are
inverted for Overdue** — a rising overdue count is red, not green.

## Related

- [[Tasks]] · [[Theming]] · [[Design System]] · [[API Endpoints]]
