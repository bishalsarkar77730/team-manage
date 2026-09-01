---
tags: [moc]
---

# Meridian — project vault

Working notes for **Meridian**, a MERN workspace/task manager. This vault is the
map: it records how the system fits together, why it is built that way, and the
traps that have already cost time. Code is the source of truth — these notes
point at it and explain the parts the code cannot say for itself.

> [!info] Repo layout
> `backend/` — Express 4 + Mongoose 8 API on port **8000**, mounted under `/api`
> `client/` — Vite 6 + React 18 SPA on port **3000** (pinned, see [[CORS and Credentials]])
> `vault/` — this vault

## Start here

- [[System Overview]] — the whole thing on one page, with diagrams
- [[Data Model]] — the ten collections and how they reference each other
- [[Permissions and Roles]] — who can do what, and where it is enforced
- [[Local Development]] — getting it running

## Architecture

| Note | What it covers |
|---|---|
| [[System Overview]] | Layers, request flow, the shape of a feature |
| [[Backend]] | Route → controller → service → model, and the conventions |
| [[Frontend]] | Routing, data fetching, state, and the component layers |
| [[Data Model]] | Every collection, every reference |
| [[Auth and Sessions]] | Local passport strategy, cookie-session, the compat shim |
| [[Permissions and Roles]] | The permission matrix and its two enforcement points |

## Features

- [[Tasks]] — statuses, priority, size, multi-assignee, the table
- [[Dashboards]] — workspace analytics and the personal dashboard
- [[Notes]] — TipTap rich text, sanitised HTML, per-item sharing
- [[Meetings]] — the hand-built month/week/day calendar
- [[Presence]] — online/last-seen without hammering the database
- [[Theming]] — three-state theme, tokens, the FOUC guard

## Reference

- [[API Endpoints]] — every route, with its guard
- [[Environment Variables]] — what each one does and where it is read
- [[Design System]] — tokens, dialog shell, page header, charts
- [[Glossary]] — terms used throughout

## Operations

- [[Local Development]]
- [[Seeders and Migrations]] — and why both were dangerous before they were fixed
- [[Deploying to DigitalOcean]]
- [[Verification Harness]] — the CDP + fixture rig used to test the real UI

## Gotchas

These are all things that have actually broken this project. Each note records
the symptom first, because the symptom is what you will recognise.

- [[Trust Proxy and Secure Cookies]] — a login that 200s and sets no cookie
- [[CORS and Credentials]] — a 401 flood that is really an origin mismatch
- [[cookie-session and Passport 0.7]] — `req.session.regenerate is not a function`
- [[Array Queries Match Element-wise]] — a migration that double-wraps arrays
- [[Role Seeding Must Preserve _id]] — a seed that locks everyone out
- [[Min Size on Flex and Grid Children]] — content that refuses to shrink
- [[Badge Variant Key Collision]] — `MEDIUM` means two different things

## Open items

- [ ] Rotate the Atlas password committed in plaintext in commit `b0c5e2f`
- [ ] Narrow the Atlas IP allowlist from `0.0.0.0/0`
- [ ] Rename the production database — it is currently called `test`
- [ ] Row-selection checkboxes in the task table are decorative; nothing reads
      `rowSelection` and there is no bulk-action bar (see [[Tasks]])
- [ ] Google OAuth is commented out, not deleted (see [[Auth and Sessions]])
