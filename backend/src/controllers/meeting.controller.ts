import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validation/workspace.validation";
import {
  createMeetingSchema,
  meetingIdSchema,
  updateMeetingSchema,
} from "../validation/meeting.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createMeetingService,
  deleteMeetingService,
  getMeetingsService,
  updateMeetingService,
} from "../services/meeting.service";
import { HTTPSTATUS } from "../config/http.config";

const requireMembership = async (userId: string, workspaceId: string) => {
  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);
};

export const getMeetingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    await requireMembership(userId, workspaceId);

    const result = await getMeetingsService(
      workspaceId,
      String(userId),
      {
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        keyword: req.query.keyword as string | undefined,
      },
      {
        pageSize: parseInt(req.query.pageSize as string) || 10,
        pageNumber: parseInt(req.query.pageNumber as string) || 1,
      }
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Meetings fetched successfully",
      ...result,
    });
  }
);

export const createMeetingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const body = createMeetingSchema.parse(req.body);

    await requireMembership(userId, workspaceId);

    const { meeting } = await createMeetingService(
      workspaceId,
      String(userId),
      body
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Meeting created successfully",
      meeting,
    });
  }
);

export const updateMeetingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const meetingId = meetingIdSchema.parse(req.params.id);
    const body = updateMeetingSchema.parse(req.body);

    await requireMembership(userId, workspaceId);

    const { meeting } = await updateMeetingService(
      workspaceId,
      String(userId),
      meetingId,
      body
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Meeting updated successfully",
      meeting,
    });
  }
);

export const deleteMeetingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const meetingId = meetingIdSchema.parse(req.params.id);

    await requireMembership(userId, workspaceId);
    await deleteMeetingService(workspaceId, String(userId), meetingId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Meeting deleted successfully",
    });
  }
);
