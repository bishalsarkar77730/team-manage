import { Router } from "express";
import {
  createNoteController,
  deleteNoteController,
  getNotesController,
  updateNoteController,
} from "../controllers/note.controller";

const noteRoutes = Router();

noteRoutes.get("/workspace/:workspaceId/all", getNotesController);
noteRoutes.post("/workspace/:workspaceId/create", createNoteController);
noteRoutes.put("/:id/workspace/:workspaceId/update", updateNoteController);
noteRoutes.delete("/:id/workspace/:workspaceId/delete", deleteNoteController);

export default noteRoutes;
