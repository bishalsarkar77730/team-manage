import mongoose from "mongoose";
import MemberModel from "../models/member.model";
import MeetingModel from "../models/meeting.model";
import { VisibilityEnum } from "../enums/visibility.enum";
import { BadRequestException, NotFoundException } from "../utils/appError";

type MeetingBody = {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  meetingLink?: string;
  location?: string;
  visibility?: string;
  sharedWith?: string[];
};

/** Same rule as notes: you may only share with actual workspace members. */
const resolveSharedWith = async (
  workspaceId: string,
  ownerId: string,
  visibility: string | undefined,
  sharedWith: string[] | undefined
) => {
  if (visibility !== VisibilityEnum.SHARED || !sharedWith?.length) return [];

  const candidates = sharedWith.filter((id) => id !== String(ownerId));
  if (!candidates.length) return [];

  const members = await MemberModel.find(
    { workspaceId, userId: { $in: candidates } },
    { userId: 1 }
  ).lean();

  return members.map((member) => member.userId);
};

const visibleToUser = (workspaceId: string, userId: string) => ({
  workspaceId: new mongoose.Types.ObjectId(workspaceId),
  $or: [
    { userId: new mongoose.Types.ObjectId(userId) },
    {
      visibility: VisibilityEnum.SHARED,
      sharedWith: new mongoose.Types.ObjectId(userId),
    },
  ],
});

/**
 * The calendar asks for a date window (a month, a week, a day) rather than a
 * page, because a month view needs every meeting in that month or the grid is
 * wrong. The list view uses the paginated branch instead.
 */
export const getMeetingsService = async (
  workspaceId: string,
  userId: string,
  filters: { from?: string; to?: string; keyword?: string },
  pagination: { pageSize: number; pageNumber: number }
) => {
  const query: Record<string, any> = visibleToUser(workspaceId, userId);

  if (filters.keyword) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  // overlap, not containment: a meeting that starts before the window and ends
  // inside it still belongs on the grid
  if (filters.from || filters.to) {
    if (filters.from) query.endAt = { $gte: new Date(filters.from) };
    if (filters.to) query.startAt = { $lte: new Date(filters.to) };
  }

  const windowed = !!(filters.from || filters.to);
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const cursor = MeetingModel.find(query)
    .sort({ startAt: 1 })
    .populate("userId", "_id name profilePicture")
    .populate("sharedWith", "_id name profilePicture");

  const [meetings, totalCount] = await Promise.all([
    // a windowed request is already bounded, so it is not paged — the grid
    // needs all of them
    windowed ? cursor.lean() : cursor.skip(skip).limit(pageSize).lean(),
    MeetingModel.countDocuments(query),
  ]);

  return {
    meetings,
    pagination: {
      pageSize: windowed ? totalCount : pageSize,
      pageNumber: windowed ? 1 : pageNumber,
      totalCount,
      totalPages: windowed ? 1 : Math.ceil(totalCount / pageSize),
      skip: windowed ? 0 : skip,
    },
  };
};

export const createMeetingService = async (
  workspaceId: string,
  userId: string,
  body: MeetingBody
) => {
  const sharedWith = await resolveSharedWith(
    workspaceId,
    userId,
    body.visibility,
    body.sharedWith
  );

  const meeting = new MeetingModel({
    userId,
    workspaceId,
    title: body.title,
    description: body.description || null,
    startAt: new Date(body.startAt),
    endAt: new Date(body.endAt),
    meetingLink: body.meetingLink || null,
    location: body.location || null,
    visibility: body.visibility || VisibilityEnum.PRIVATE,
    sharedWith,
  });

  await meeting.save();
  return { meeting };
};

export const updateMeetingService = async (
  workspaceId: string,
  userId: string,
  meetingId: string,
  body: MeetingBody
) => {
  const meeting = await MeetingModel.findOne({ _id: meetingId, workspaceId });

  if (!meeting) {
    throw new NotFoundException("Meeting not found in this workspace");
  }

  if (String(meeting.userId) !== String(userId)) {
    throw new BadRequestException("Only the organiser can edit this meeting");
  }

  const sharedWith = await resolveSharedWith(
    workspaceId,
    userId,
    body.visibility,
    body.sharedWith
  );

  meeting.title = body.title;
  meeting.description = body.description || null;
  meeting.startAt = new Date(body.startAt);
  meeting.endAt = new Date(body.endAt);
  meeting.meetingLink = body.meetingLink || null;
  meeting.location = body.location || null;
  meeting.visibility = (body.visibility ||
    VisibilityEnum.PRIVATE) as typeof meeting.visibility;
  meeting.sharedWith = sharedWith as typeof meeting.sharedWith;

  await meeting.save();
  return { meeting };
};

export const deleteMeetingService = async (
  workspaceId: string,
  userId: string,
  meetingId: string
) => {
  const meeting = await MeetingModel.findOneAndDelete({
    _id: meetingId,
    workspaceId,
    userId,
  });

  if (!meeting) {
    throw new NotFoundException(
      "Meeting not found, or you are not its organiser"
    );
  }

  return;
};
