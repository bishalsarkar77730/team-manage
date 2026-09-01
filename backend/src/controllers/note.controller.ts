import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validation/workspace.validation";
import {
  createNoteSchema,
  noteIdSchema,
  updateNoteSchema,
} from "../validation/note.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createNoteService,
  deleteNoteService,
  getNotesService,
  updateNoteService,
} from "../services/note.service";
import { HTTPSTATUS } from "../config/http.config";

/**
 * Every handler checks workspace membership first. Notes are personal, but they
 * still live inside a workspace, so a non-member must not be able to read or
 * write them by guessing the id.
 */
const requireMembership = async (userId: string, workspaceId: string) => {
  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);
};

export const getNotesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    await requireMembership(userId, workspaceId);

    const result = await getNotesService(
      workspaceId,
      String(userId),
      { keyword: req.query.keyword as string | undefined },
      {
        pageSize: parseInt(req.query.pageSize as string) || 10,
        pageNumber: parseInt(req.query.pageNumber as string) || 1,
      }
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Notes fetched successfully",
      ...result,
    });
  }
);

export const createNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const body = createNoteSchema.parse(req.body);

    await requireMembership(userId, workspaceId);

    const { note } = await createNoteService(workspaceId, String(userId), body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Note created successfully",
      note,
    });
  }
);

export const updateNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const noteId = noteIdSchema.parse(req.params.id);
    const body = updateNoteSchema.parse(req.body);

    await requireMembership(userId, workspaceId);

    const { note } = await updateNoteService(
      workspaceId,
      String(userId),
      noteId,
      body
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Note updated successfully",
      note,
    });
  }
);

export const deleteNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const noteId = noteIdSchema.parse(req.params.id);

    await requireMembership(userId, workspaceId);
    await deleteNoteService(workspaceId, String(userId), noteId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Note deleted successfully",
    });
  }
);
