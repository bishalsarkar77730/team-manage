import { Router } from "express";
import { getCurrentUserController } from "../controllers/user.controller";
import { heartbeatController } from "../controllers/presence.controller";

const userRoutes = Router();

userRoutes.get("/current", getCurrentUserController);

// touches nothing itself — the presence middleware on this route group does the
// work. Exists so an idle tab can stay counted as active without polling a real
// endpoint.
userRoutes.post("/heartbeat", heartbeatController);

export default userRoutes;
