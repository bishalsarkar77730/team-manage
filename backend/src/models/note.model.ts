import mongoose, { Document, Schema } from "mongoose";
import { VisibilityEnum, VisibilityEnumType } from "../enums/visibility.enum";

export interface NoteDocument extends Document {
  /** the author — the only person who may edit or delete it */
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  /** rich text, stored as sanitised HTML */
  content: string;
  visibility: VisibilityEnumType;
  /** workspace members the author chose to share with, when SHARED */
  sharedWith: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<NoteDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    visibility: {
      type: String,
      enum: Object.values(VisibilityEnum),
      default: VisibilityEnum.PRIVATE,
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// The list query is always "notes in this workspace visible to me, newest
// first", so index the fields it filters and sorts on.
noteSchema.index({ workspaceId: 1, userId: 1, updatedAt: -1 });
noteSchema.index({ workspaceId: 1, sharedWith: 1, updatedAt: -1 });

const NoteModel = mongoose.model<NoteDocument>("Note", noteSchema);

export default NoteModel;
