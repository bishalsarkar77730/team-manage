import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import touchPresence from "./middlewares/touchPresence.middleware";
import { sessionCompat } from "./middlewares/sessionCompat.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import noteRoutes from "./routes/note.route";
import meetingRoutes from "./routes/meeting.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

// Required behind any TLS-terminating proxy (DigitalOcean App Platform, nginx,
// Cloudflare). Those forward to Node over plain HTTP with X-Forwarded-Proto,
// so without this `req.protocol` is "http" — and the `cookies` library refuses
// to send a `secure` cookie over what it believes is an unencrypted
// connection. cookie-session swallows that error into a debug log, so the
// symptom is a login that returns 200, sets no cookie, and 401s on every
// request afterwards, with nothing in the server output.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// SESSION_EXPIRES_IN is in hours. Falls back to 24h if it is missing or not a
// positive number, so a bad value degrades instead of producing a NaN maxAge.
const sessionHours = Number(config.SESSION_EXPIRES_IN);
const sessionMaxAge =
  (Number.isFinite(sessionHours) && sessionHours > 0 ? sessionHours : 24) *
  60 *
  60 *
  1000;

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: sessionMaxAge,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  })
);

app.use(sessionCompat);

app.use(passport.initialize());
app.use(passport.session());

// Platform health check. Must stay dependency-free and return 2xx: the `/`
// route below deliberately throws, so pointing a health check at `/` would
// fail every deploy.
app.get(`/health`, (_req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({ status: "ok", uptime: process.uptime() });
});

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException(
      "This is a bad request",
      ErrorCodeEnum.AUTH_INVALID_TOKEN
    );
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, touchPresence, userRoutes);
app.use(
  `${BASE_PATH}/workspace`,
  isAuthenticated,
  touchPresence,
  workspaceRoutes
);
app.use(`${BASE_PATH}/member`, isAuthenticated, touchPresence, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, touchPresence, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, touchPresence, taskRoutes);
app.use(`${BASE_PATH}/note`, isAuthenticated, touchPresence, noteRoutes);
app.use(
  `${BASE_PATH}/meeting`,
  isAuthenticated,
  touchPresence,
  meetingRoutes
);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
