import mongoose from "mongoose";
import MemberModel from "../models/member.model";
import NoteModel from "../models/note.model";
import { VisibilityEnum } from "../enums/visibility.enum";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { sanitizeNoteHtml } from "../utils/sanitizeHtml";

type NoteBody = {
  title: string;
  content?: string;
  visibility?: string;
  sharedWith?: string[];
};

/**
 * A note may only be shared with people who are actually in the workspace —
 * otherwise `sharedWith` becomes a way to leak content to an arbitrary user id.
 * Returns the ids that survived the check.
 */
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

/** Notes in this workspace that this user is allowed to see. */
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

export const getNotesService = async (
  workspaceId: string,
  userId: string,
  filters: { keyword?: string },
  pagination: { pageSize: number; pageNumber: number }
) => {
  const query: Record<string, any> = visibleToUser(workspaceId, userId);

  if (filters.keyword) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [notes, totalCount] = await Promise.all([
    NoteModel.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("userId", "_id name profilePicture")
      .populate("sharedWith", "_id name profilePicture")
      .lean(),
    NoteModel.countDocuments(query),
  ]);

  return {
    notes,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      skip,
    },
  };
};

export const createNoteService = async (
  workspaceId: string,
  userId: string,
  body: NoteBody
) => {
  const sharedWith = await resolveSharedWith(
    workspaceId,
    userId,
    body.visibility,
    body.sharedWith
  );

  const note = new NoteModel({
    userId,
    workspaceId,
    title: body.title,
    content: sanitizeNoteHtml(body.content),
    visibility: body.visibility || VisibilityEnum.PRIVATE,
    sharedWith,
  });

  await note.save();
  return { note };
};

export const updateNoteService = async (
  workspaceId: string,
  userId: string,
  noteId: string,
  body: NoteBody
) => {
  const note = await NoteModel.findOne({ _id: noteId, workspaceId });

  if (!note) {
    throw new NotFoundException("Note not found in this workspace");
  }

  // being shared a note lets you read it, not rewrite it
  if (String(note.userId) !== String(userId)) {
    throw new BadRequestException("Only the author can edit this note");
  }

  const sharedWith = await resolveSharedWith(
    workspaceId,
    userId,
    body.visibility,
    body.sharedWith
  );

  note.title = body.title;
  note.content = sanitizeNoteHtml(body.content);
  note.visibility = (body.visibility ||
    VisibilityEnum.PRIVATE) as typeof note.visibility;
  note.sharedWith = sharedWith as typeof note.sharedWith;

  await note.save();
  return { note };
};

export const deleteNoteService = async (
  workspaceId: string,
  userId: string,
  noteId: string
) => {
  const note = await NoteModel.findOneAndDelete({
    _id: noteId,
    workspaceId,
    userId,
  });

  if (!note) {
    throw new NotFoundException(
      "Note not found, or you are not its author"
    );
  }

  return;
};
