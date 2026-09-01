---
tags: [ops]
---

# Local Development

> [!warning] This is a Windows PowerShell 5.1 box
> `&&` is **not** a valid separator. Use `;` and `if ($?)`:
> ```powershell
> cd backend; if ($?) { npm run seed }
> ```
> Also unavailable in 5.1: ternary `?:`, `??`, `?.`, and `-AsHashtable`.
> A Bash tool exists separately if you want POSIX syntax.

## Running it

Two terminals.

```powershell
# terminal 1
cd backend; npm run dev      # tsx watch, http://localhost:8000

# terminal 2
cd client; npm run dev       # vite,      http://localhost:3000
```

Ports are not arbitrary. `FRONTEND_ORIGIN` in `backend/.env` must equal the
client's origin exactly, and Vite is pinned with `strictPort: true` so a busy
port fails loudly rather than silently sliding to 5173 and breaking auth.
[[CORS and Credentials]]

## Scripts

| Where | Command | Does |
|---|---|---|
| backend | `npm run dev` | `tsx watch src/index.ts` |
| backend | `npm run typecheck` | `tsc --noEmit` |
| backend | `npm run build` | `tsc` → `dist/` |
| backend | `npm start` | `node dist/index.js` |
| backend | `npm run seed` | Roles → [[Seeders and Migrations]] |
| backend | `npm run migrate:assignees` | Scalar → array `assignedTo` |
| client | `npm run dev` | Vite dev server |
| client | `npm run build` | `tsc -b && vite build` |
| client | `npm run lint` | ESLint |

## Before calling anything done

```powershell
cd client;  npx tsc --noEmit -p tsconfig.app.json; npm run build; npm run lint
cd backend; npx tsc --noEmit
```

Current baseline: **0 errors, 34 ESLint warnings** on the client. The warnings
are pre-existing (mostly `react-hooks/incompatible-library` from TanStack
Table). If the count moves, it was you.

For anything user-visible, also run [[Verification Harness]] — the build passing
says nothing about whether the page looks right.

## First-time setup

1. `npm i` in both `backend/` and `client/`
2. Create `backend/.env` — see [[Environment Variables]]
3. `cd backend; npm run seed` to create the three roles
4. Register a user through the UI; the first workspace makes them OWNER

## Related

- [[Environment Variables]] · [[Seeders and Migrations]] · [[Verification Harness]]
