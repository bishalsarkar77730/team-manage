---
tags: [reference, ops]
---

# Environment Variables

> [!danger] Never commit real values
> `backend/.env` holds a live Atlas connection string. One was committed in
> plaintext in commit `b0c5e2f` and **still needs rotating**. The names below
> are safe to write down; the values are not.

## Backend — `backend/.env`

| Variable | Default | What it does |
|---|---|---|
| `PORT` | `5000` in config, `8000` in `.env` | Listen port |
| `NODE_ENV` | `development` | **Only** effect: `secure: true` on the session cookie in production |
| `BASE_PATH` | `/api` | Prefix every route group is mounted under |
| `MONGO_URI` | — | Atlas connection string. Currently points at a database literally named `test` |
| `SESSION_SECRET` | — | cookie-session signing key |
| `SESSION_EXPIRES_IN` | `24` | Session lifetime **in hours**. Falls back to 24 if missing or not positive |
| `FRONTEND_ORIGIN` | `localhost` | Exact origin echoed in `Access-Control-Allow-Origin`. Must match the browser's origin **exactly** — [[CORS and Credentials]] |

Read through `utils/get-env.ts` into `config/app.config.ts`. Nothing reads
`process.env` directly.

Still present but unread (Google OAuth is commented out — see
[[Auth and Sessions]]): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GOOGLE_CALLBACK_URL`, `FRONTEND_GOOGLE_CALLBACK_URL`.

## Client — `client/.env`, `client/.env.production`

Exactly one variable. Vite inlines `VITE_*` at **build** time, so it is baked
into the bundle and is public. Never put a secret in it.

| File | Value | Used by |
|---|---|---|
| `.env` | `http://localhost:8000/api` | `npm run dev` |
| `.env.production` | `/api` | `vite build` |

The production value is **relative on purpose**. Behind one DigitalOcean domain
the browser calls the origin it was served from, which means no CORS preflight,
no `FRONTEND_ORIGIN` to keep in sync, a first-party session cookie, and one
build artifact that works on any domain. See [[Deploying to DigitalOcean]].

## The two that must agree in development

`FRONTEND_ORIGIN=http://localhost:3000` and Vite's `server.port`. Vite is pinned
with `strictPort: true` so a busy port fails loudly instead of quietly moving to
5173 and breaking auth. This exact mismatch once produced a flood of 401s that
looked like an auth bug — [[CORS and Credentials]].

## Related

- [[Local Development]] · [[Deploying to DigitalOcean]] · [[Auth and Sessions]]
