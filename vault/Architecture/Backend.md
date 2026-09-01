---
tags: [architecture, backend]
---

# Backend

Express 4, Mongoose 8, TypeScript, run with `tsx`. Entry point is
`backend/src/index.ts`.

## Middleware order in `index.ts`

Order is load-bearing. Two lines in particular:

```ts
app.set("trust proxy", 1);   // MUST be before the session middleware
app.use(cors({ origin: config.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(session({ ... }));
app.use(sessionCompat);      // MUST be after session, before passport
app.use(passport.initialize());
app.use(passport.session());
```

- `trust proxy` first, or secure cookies silently vanish behind TLS termination
  — [[Trust Proxy and Secure Cookies]]
- `sessionCompat` between session and passport, or login throws —
  [[cookie-session and Passport 0.7]]
- CORS before the routes, and `credentials: true` means the ACAO header can
  never be `*` — [[CORS and Credentials]]

`errorHandler` is registered **last**, after all routes.

## Conventions

**`asyncHandler` wraps every controller.** Express 4 does not catch rejected
promises, so an unwrapped `async` controller turns any thrown error into an
unhandled rejection and a hung request.

```ts
export const getAllTasksController = asyncHandler(async (req, res) => { ... });
```

**Errors are thrown, not returned.** `utils/appError.ts` defines
`BadRequestException`, `UnauthorizedException`, `NotFoundException` and friends,
each carrying an `ErrorCodeEnum`. `errorHandler` turns them into JSON. Services
throw; controllers do not catch.

**Validation is zod, at the controller boundary.** Never trust a param or a
body inside a service.

**Roles are resolved in the controller, enforced by `roleGuard`.** See
[[Permissions and Roles]] — this is where the two task permissions get their
branching.

## Services worth knowing

| Service | Notable |
|---|---|
| `task.service.ts` | `resolveAssignees` rejects non-members; `ownTaskFilter` builds the `$or`; `getMyTaskAnalyticsService` is two `$group` pipelines + an overdue count |
| `presence.service.ts` | In-process throttle map + an aggregation-pipeline update — [[Presence]] |
| `note.service.ts` | `visibleToUser` and `resolveSharedWith` — [[Notes]] |
| `meeting.service.ts` | Same visibility pattern, plus range queries — [[Meetings]] |
| `workspace.service.ts` | `getWorkspaceAnalyticsService` returns `inReviewTasks` |

## Aggregation-pipeline updates

Used in two places ([[Presence]] and the assignee migration). The point is
**atomicity**: the new value is computed from the old one *inside* the database,
so there is no read-modify-write race and no round trip.

```ts
collection.updateMany(filter, [{ $set: { field: { $cond: [...] } } }]);
```

Note the array — an array as the second argument is a pipeline, an object is a
plain update. They behave very differently, and one specific difference has bitten
this project: [[Array Queries Match Element-wise]].

## Related

- [[System Overview]] · [[API Endpoints]] · [[Auth and Sessions]] · [[Data Model]]
