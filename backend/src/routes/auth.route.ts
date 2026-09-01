import { Router } from "express";
import {
  loginController,
  logOutController,
  registerUserController,
} from "../controllers/auth.controller";

// --- Google OAuth (disabled) ---
// import passport from "passport";
// import { config } from "../config/app.config";
// import { googleLoginCallback } from "../controllers/auth.controller";
//
// const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

const authRoutes = Router();

authRoutes.post("/register", registerUserController);
authRoutes.post("/login", loginController);

authRoutes.post("/logout", logOutController);

// --- Google OAuth (disabled) ---
// authRoutes.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );
//
// authRoutes.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: failedUrl,
//   }),
//   googleLoginCallback
// );

export default authRoutes;
