---
tags: [gotcha, backend, deployment]
---

# Trust Proxy and Secure Cookies

## Symptom

In production only: `POST /api/auth/login` returns **200 OK** with a valid user
body, and **no `Set-Cookie` header**. Every subsequent request 401s. Nothing in
the server logs. Locally everything works.

## Cause

A TLS-terminating proxy — DigitalOcean App Platform, nginx, Cloudflare — accepts
HTTPS and forwards to Node over **plain HTTP**, with the original scheme in
`X-Forwarded-Proto`.

Express ignores that header unless you tell it to trust the proxy. So
`req.protocol` is `"http"`, and:

1. `cookies/index.js:125` throws — it refuses to send a `secure` cookie over
   what it believes is an unencrypted connection
2. `cookie-session/index.js:130` **catches that and routes it to `debug()`**

`debug` is off by default. The error disappears, the response succeeds, and no
cookie is set.

## Fix

One line, and it must come **before** the session middleware:

```ts
app.set("trust proxy", 1);
```

Already present in `backend/src/index.ts` with a comment explaining why. Do not
remove it.

## How it was proved

A harness that ran the real Express app behind a fake `X-Forwarded-Proto: https`
with `NODE_ENV=production`, and asserted on the presence of `Set-Cookie` — 200
with no cookie before, 200 with a cookie after. Guessing would not have been
enough; the failure is silent by construction.

## Related

- [[Auth and Sessions]] · [[Deploying to DigitalOcean]] · [[Backend]]
