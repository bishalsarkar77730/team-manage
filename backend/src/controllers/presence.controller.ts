import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import { getWorkspacePresenceService } from "../services/presence.service";
import { HTTPSTATUS } from "../config/http.config";

export const getWorkspacePresenceController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.id);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getWorkspacePresenceService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace presence fetched successfully",
      ...result,
    });
  }
);

/**
 * Keeps an otherwise idle tab counted as active. The work is already done by
 * the touchPresence middleware this route sits behind, so the handler itself
 * does nothing and returns no body.
 */
export const heartbeatController = asyncHandler(
  async (_req: Request, res: Response) => {
    return res.status(HTTPSTATUS.NO_CONTENT).send();
  }
);
