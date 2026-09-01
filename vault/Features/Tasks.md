---
tags: [feature]
---

# Tasks

The core object. `backend/src/models/task.model.ts`,
`client/src/components/workspace/task/`.

## Fields

| Field | Values |
|---|---|
| `status` | `BACKLOG` `TODO` `IN_PROGRESS` `IN_REVIEW` `DONE` |
| `priority` | `LOW` `MEDIUM` `HIGH` |
| `size` | `SMALL` `MEDIUM` `LARGE` |
| `assignedTo` | `ObjectId[]` — many members |
| `taskCode` | short human id, e.g. `task-a1b` |

> [!warning] `MEDIUM` is ambiguous
> `TaskPriorityEnum.MEDIUM` and `TaskSizeEnum.MEDIUM` are the same string.
> See [[Badge Variant Key Collision]] — Size deliberately uses
> `variant="outline"` rather than a colour-coded variant.

## Multi-assignee

A task belongs to several members and **all of them can see and edit it**.
`assignedTo` is an array end to end.

- `resolveAssignees` in `task.service.ts` throws `BadRequestException` if any id
  is not a member of the workspace — otherwise `assignedTo` becomes a way to
  grant access to an arbitrary user.
- The validation schema accepts `string | string[] | null` so a single id from
  an older client still works.
- `ownTaskFilter(userId)` returns `{ $or: [{ createdBy: id }, { assignedTo: id }] }`.
  MongoDB matches a scalar against an array member, which is what makes this
  one-liner work — and is also the trap in [[Array Queries Match Element-wise]].

Existing scalar values are migrated by `npm run migrate:assignees`
([[Seeders and Migrations]]).

**UI:** `assignee-select.tsx` is a searchable multi-select — avatars, a check
per selected row, the popover stays open across picks, and removable chips
below the trigger. In the table, up to three overlapping avatars render, then
`+N`; a single assignee shows their name, and the full list is in the `title`
attribute.

## Tasks vs My Tasks

One component, `task-table.tsx`, with a `mine` prop.

|  | `/tasks` | `/my-tasks` |
|---|---|---|
| Route gate | `withPermission(Tasks, VIEW_ALL_TASKS)` | none |
| Request | no flag | `?mine=true` |
| Assignee facet filter | shown | hidden |
| Delete in row menu | needs `DELETE_TASK` | hidden for members |
| Who sees it in the nav | `VIEW_ALL_TASKS` holders | everyone |

A member creating from My Tasks writes to the same collection, so it appears in
All Tasks for anyone who can see all tasks. See [[Permissions and Roles]].

## The table

`components/workspace/task/table/`, TanStack Table v8, nine columns. It is
genuinely wider than a 1280px content area (~933px of columns against ~862px
available), so the wrapper scrolls sideways with CSS scrolling shadows to make
that legible rather than looking clipped. Width was already reclaimed by:

- stacking the task code **above** the title instead of beside it
- `MMM d, yyyy` dates instead of `PPP`
- letting badges size to content rather than reserving fixed widths
- avatars alone for multiple assignees, `+N` only past three

> [!bug] Dead control
> The row-selection checkbox column is decorative. Nothing reads `rowSelection`
> and there is no bulk-action bar. Removing it would recover ~32px.

## Analytics

`GET /api/task/workspace/:id/my-analytics` returns the personal figures used by
My Dashboard — see [[Dashboards]].

## Related

- [[Dashboards]] · [[Permissions and Roles]] · [[Data Model]] · [[Design System]]
