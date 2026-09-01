import { Router } from "express";
import {
  createMeetingController,
  deleteMeetingController,
  getMeetingsController,
  updateMeetingController,
} from "../controllers/meeting.controller";

const meetingRoutes = Router();

meetingRoutes.get("/workspace/:workspaceId/all", getMeetingsController);
meetingRoutes.post("/workspace/:workspaceId/create", createMeetingController);
meetingRoutes.put("/:id/workspace/:workspaceId/update", updateMeetingController);
meetingRoutes.delete(
  "/:id/workspace/:workspaceId/delete",
  deleteMeetingController
);

export default meetingRoutes;
