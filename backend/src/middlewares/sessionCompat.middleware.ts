import { NextFunction, Request, Response } from "express";

type SessionCallback = (err?: any) => void;

const defineHelper = (
  session: Record<string, any>,
  name: string,
  value: (cb: SessionCallback) => void
) => {
  if (typeof session[name] === "function") return;

  // Non-enumerable on purpose: cookie-session derives `isPopulated` from
  // Object.keys(session) and serializes the session with JSON.stringify, so an
  // enumerable helper would make every anonymous request look like it carries a
  // session and set a needless cookie.
  Object.defineProperty(session, name, {
    value,
    enumerable: false,
    configurable: true,
    writable: true,
  });
};

/**
 * passport >= 0.6 calls `req.session.regenerate()` and `req.session.save()` on
 * login and logout, but only `express-session` implements those. With
 * `cookie-session` the session *is* the signed cookie, so:
 *
 * - `regenerate` drops every value the session currently holds. There is no
 *   server-side session id to rotate, so clearing the payload is what guards
 *   against session fixation here. It mutates in place rather than assigning
 *   `req.session = {}` so that passport keeps seeing these helpers on the
 *   session it holds a reference to.
 * - `save` is a no-op: cookie-session writes the cookie itself from an
 *   `onHeaders` hook as the response is sent.
 */
export const sessionCompat = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const session = req.session;

  if (!session) return next();

  defineHelper(session, "regenerate", (cb) => {
    for (const key of Object.keys(session)) {
      delete session[key];
    }
    cb();
  });

  defineHelper(session, "save", (cb) => cb());

  next();
};

export default sessionCompat;
