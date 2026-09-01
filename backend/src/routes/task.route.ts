import { Router } from "express";
import {
  createTaskController,
  deleteTaskController,
  getAllTasksController,
  getMyTaskAnalyticsController,
  getTaskByIdController,
  updateTaskController,
} from "../controllers/task.controller";

const taskRoutes = Router();

taskRoutes.post(
  "/project/:projectId/workspace/:workspaceId/create",
  createTaskController
);

taskRoutes.delete("/:id/workspace/:workspaceId/delete", deleteTaskController);

taskRoutes.put(
  "/:id/project/:projectId/workspace/:workspaceId/update",
  updateTaskController
);

taskRoutes.get("/workspace/:workspaceId/all", getAllTasksController);

taskRoutes.get(
  "/workspace/:workspaceId/my-analytics",
  getMyTaskAnalyticsController
);

taskRoutes.get(
  "/:id/project/:projectId/workspace/:workspaceId",
  getTaskByIdController
);

export default taskRoutes;
