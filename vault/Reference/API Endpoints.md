---
tags: [reference, api]
---

# API Endpoints

Base path `/api` (`BASE_PATH`). Every group except `/auth` is mounted behind
`isAuthenticated` + `touchPresence`.

Permissions in the last column are enforced by `roleGuard` server-side — see
[[Permissions and Roles]].

## Unauthenticated

| Method | Path | Notes |
|---|---|---|
| `GET` | `/health` | Dependency-free. Point platform health checks here — `/` throws on purpose |
| `POST` | `/api/auth/register` | |
| `POST` | `/api/auth/login` | passport local |
| `POST` | `/api/auth/logout` | |

## User

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/user/current` | The session user |
| `POST` | `/api/user/heartbeat` | [[Presence]] |

## Workspace

| Method | Path | Permission |
|---|---|---|
| `POST` | `/api/workspace/create/new` | `CREATE_WORKSPACE` |
| `PUT` | `/api/workspace/update/:id` | `EDIT_WORKSPACE` |
| `DELETE` | `/api/workspace/delete/:id` | `DELETE_WORKSPACE` |
| `GET` | `/api/workspace/all` | membership |
| `GET` | `/api/workspace/:id` | membership |
| `GET` | `/api/workspace/members/:id` | `VIEW_ONLY` |
| `GET` | `/api/workspace/analytics/:id` | `VIEW_ONLY` — returns `inReviewTasks` |
| `GET` | `/api/workspace/presence/:id` | `VIEW_ONLY` |

## Member

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/member/workspace/:inviteCode/join` | Joins by invite code |

## Project

| Method | Path | Permission |
|---|---|---|
| `POST` | `/api/project/workspace/:workspaceId/create` | `CREATE_PROJECT` |
| `PUT` | `/api/project/:id/workspace/:workspaceId/update` | `EDIT_PROJECT` |
| `DELETE` | `/api/project/:id/workspace/:workspaceId/delete` | `DELETE_PROJECT` |
| `GET` | `/api/project/workspace/:workspaceId/all` | `VIEW_ONLY` |
| `GET` | `/api/project/:id/workspace/:workspaceId` | `VIEW_ONLY` |
| `GET` | `/api/project/:id/workspace/:workspaceId/analytics` | `VIEW_ONLY` |

## Task

| Method | Path | Permission |
|---|---|---|
| `POST` | `/api/task/project/:projectId/workspace/:workspaceId/create` | `CREATE_TASK` |
| `PUT` | `/api/task/:id/project/:projectId/workspace/:workspaceId/update` | `EDIT_TASK`, else `EDIT_OWN_TASK` scoped to own |
| `DELETE` | `/api/task/:id/workspace/:workspaceId/delete` | `DELETE_TASK` |
| `GET` | `/api/task/workspace/:workspaceId/all` | `VIEW_ONLY`; without `VIEW_ALL_TASKS`, or with `?mine=true`, scoped to own |
| `GET` | `/api/task/workspace/:workspaceId/my-analytics` | `VIEW_ONLY` — [[Dashboards]] |
| `GET` | `/api/task/:id/project/:projectId/workspace/:workspaceId` | `VIEW_ONLY` |

`/all` query params: `keyword`, `projectId`, `status`, `priority`, `assignedTo`,
`dueDate`, `mine`, `pageNumber`, `pageSize`.

## Note

| Method | Path |
|---|---|
| `GET` | `/api/note/workspace/:workspaceId/all` |
| `POST` | `/api/note/workspace/:workspaceId/create` |
| `PUT` | `/api/note/:id/workspace/:workspaceId/update` |
| `DELETE` | `/api/note/:id/workspace/:workspaceId/delete` |

Scoped by author-or-shared, not by role — [[Notes]].

## Meeting

| Method | Path |
|---|---|
| `GET` | `/api/meeting/workspace/:workspaceId/all` |
| `POST` | `/api/meeting/workspace/:workspaceId/create` |
| `PUT` | `/api/meeting/:id/workspace/:workspaceId/update` |
| `DELETE` | `/api/meeting/:id/workspace/:workspaceId/delete` |

Scoped by organiser-or-shared — [[Meetings]].

## Related

- [[Backend]] · [[Permissions and Roles]] · [[Environment Variables]]
