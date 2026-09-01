---
tags: [gotcha, backend]
---

# cookie-session and Passport 0.7

## Symptom

```
TypeError: req.session.regenerate is not a function
```

on login, from inside `req.logIn()`.

## Cause

Passport 0.6 added a session fixation defence: on login it calls
`req.session.regenerate()`, and after writing the user it calls
`req.session.save()`. Both are part of the **`express-session`** API.

This project uses **`cookie-session`**, which stores the whole session in the
cookie itself. It has no server-side store to regenerate and no save step — so
neither method exists.

## Fix

`backend/src/middlewares/sessionCompat.middleware.ts` adds both as no-op-ish
shims, registered **after** `session()` and **before** `passport.initialize()`:

```ts
app.use(session({ ... }));
app.use(sessionCompat);
app.use(passport.initialize());
app.use(passport.session());
```

Two details that matter:

**The properties must be non-enumerable.** cookie-session serialises the session
object into the cookie. Plain enumerable function properties would be walked
during serialisation and either bloat the cookie or throw.

**`regenerate` must clear the session before calling back**, or the fixation
defence it is standing in for is defeated — the point of regenerating is that a
pre-login session identifier cannot survive into the authenticated session.

## Verified

Full login → `/api/user/current` → logout round trip against a real server.

## Alternatives not taken

Switching to `express-session` would need a session store (another dependency
and another thing to operate). Pinning passport to 0.5 gives up security fixes.
The shim is nine lines.

## Related

- [[Auth and Sessions]] · [[Backend]]
