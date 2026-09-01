---
tags: [gotcha, backend, frontend]
---

# CORS and Credentials

## Symptom

A continuous flood of `UnauthorizedException` stack traces on
`GET /api/user/current`. Looks like a broken session. Is not.

## Cause

The browser refused to *send* the session cookie, because the response's
`Access-Control-Allow-Origin` did not exactly match the page's origin.

In the case that actually happened: `FRONTEND_ORIGIN` was
`http://localhost:3000` while Vite had quietly started on **5173** because 3000
was busy. Two different origins ⇒ cookie dropped ⇒ no session ⇒ 401 on every
poll.

## The rule

With `credentials: true`, the ACAO header must be a **single exact origin**.
`*` is illegal in that combination and the browser discards the response
entirely.

```ts
app.use(cors({
  origin: config.FRONTEND_ORIGIN,   // exact, never "*"
  credentials: true,
}));
```

Scheme, host, and port all count. `http://localhost:3000` ≠
`http://127.0.0.1:3000`.

## Fix

Vite is pinned so it can never move silently:

```ts
server: { port: 3000, strictPort: true }
```

`strictPort` makes a busy port a hard failure instead of a silent reassignment
that breaks auth in a way that looks like something else entirely.

Keep `FRONTEND_ORIGIN` in `backend/.env` equal to that origin.

## In production this disappears

Client and API share one DigitalOcean domain and the client calls a relative
`/api`, so there is no cross-origin request at all. See
[[Deploying to DigitalOcean]].

## It bites test harnesses too

A fixture server returning a wildcard ACAO with `withCredentials: true` makes
the app look logged out. That cost real time — [[Verification Harness]].

## Related

- [[Auth and Sessions]] · [[Environment Variables]] · [[Local Development]]
