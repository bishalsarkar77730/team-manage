---
tags: [reference]
---

# Glossary

**ACAO** — `Access-Control-Allow-Origin`. With `credentials: true` it must be an
exact origin, never `*`. [[CORS and Credentials]]

**Aggregation-pipeline update** — passing an *array* as the second argument to
`updateOne`/`updateMany`, letting the new value be computed from the old one
inside the database. Used in [[Presence]] and the assignee migration.

**CDP** — Chrome DevTools Protocol. The websocket API used by
[[Verification Harness]] to drive a real headless browser.

**Facet filter** — the `+ Status` / `+ Priority` style multi-select above the
task table. `table-faceted-filter.tsx`.

**FOUC** — flash of unstyled content. Here specifically the white flash a dark
mode user sees before React mounts. [[Theming]]

**MOC** — map of content. An Obsidian index note. [[Home]] is this vault's.

**Own task** — created by you **or** assigned to you. `ownTaskFilter` in
`task.service.ts`. [[Permissions and Roles]]

**Ordinal** — a categorical scale with a meaningful order (`LOW → HIGH`). Gets a
sequential single-hue ramp, never categorical colours. [[Dashboards]]

**Presence window** — `PRESENCE_ONLINE_WINDOW_MS`, 150s. Seen inside it ⇒
online. [[Presence]]

**Resolved theme** — `light` or `dark` after `system` has been resolved through
`matchMedia`. What components actually read. [[Theming]]

**Role guard** — `roleGuard(role, [Permissions.X])`, throws
`UnauthorizedException`. The server-side half of [[Permissions and Roles]].

**Session compat** — the shim adding non-enumerable `regenerate`/`save` to
cookie-session's session object so passport 0.7 works.
[[cookie-session and Passport 0.7]]

**Task code** — the short human id on a task, e.g. `task-a1b`. Not the `_id`.

**Throwaway database** — a uniquely named database created and dropped by a
verification script, so tests never touch application collections.
[[Verification Harness]]

**Visibility** — `PRIVATE` or `SHARED`, on notes and meetings. Per item,
opt-in, no admin override. [[Data Model]]
