---
tags: [feature]
---

# Meetings

A Google-Calendar-flavoured view of meetings in a workspace.
`/workspace/:id/my-meetings`.

`backend/src/services/meeting.service.ts`,
`client/src/page/workspace/Meetings.tsx`,
`client/src/components/workspace/meeting/calendar-views.tsx`,
`client/src/components/workspace/meeting/meeting-dialog.tsx`.

## Model

```
userId, workspaceId, title, description,
startAt, endAt,
meetingLink,    // Meet / Zoom / Teams, or anything else to join by
location,
visibility, sharedWith[]
```

Visibility works exactly as in [[Notes]] — `PRIVATE` or `SHARED` with named
workspace members, filtered through the same membership check so you cannot
share with a non-member. Only the organiser may edit or delete.

## The calendar

Hand-built on **date-fns 3**. No calendar library — the three views are small
enough that a dependency was not worth it, and the grid needed to match the rest
of the [[Design System]].

| View | Layout |
|---|---|
| Month | 6×7 grid of day cells, meetings as chips, overflow as "+N more" |
| Week | 7 day columns, meetings positioned by time |
| Day | Single column, hour rows |

Today is marked, and the view is switchable in the page header.

Backend range queries take `from` / `to` and return meetings that **overlap** the
window, not just those that start inside it — a meeting spanning midnight must
appear on both days.

## Related

- [[Notes]] · [[Data Model]] · [[Design System]] · [[API Endpoints]]
