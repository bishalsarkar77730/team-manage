import mongoose, { Document, Schema } from "mongoose";
import { VisibilityEnum, VisibilityEnumType } from "../enums/visibility.enum";

export interface MeetingDocument extends Document {
  /** the organiser — the only person who may edit or delete it */
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  /** Meet / Zoom / Teams url, or anything else to join by */
  meetingLink: string | null;
  location: string | null;
  visibility: VisibilityEnumType;
  sharedWith: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<MeetingDocument>(
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
    description: { type: String, trim: true, default: null },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    meetingLink: { type: String, trim: true, default: null },
    location: { type: String, trim: true, default: null },
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

// Calendar views always ask for a date window, so startAt leads the indexes.
meetingSchema.index({ workspaceId: 1, userId: 1, startAt: 1 });
meetingSchema.index({ workspaceId: 1, sharedWith: 1, startAt: 1 });

const MeetingModel = mongoose.model<MeetingDocument>("Meeting", meetingSchema);

export default MeetingModel;
