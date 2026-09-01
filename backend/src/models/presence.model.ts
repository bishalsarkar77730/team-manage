import mongoose, { Document, Schema } from "mongoose";

/**
 * One tiny document per user, kept out of the User collection on purpose: the
 * user document is populated into task and member listings, so churning it
 * every minute would invalidate those reads and bloat `updatedAt` history.
 *
 * Note there is no `isOnline` field. Online is derived from how stale
 * `lastSeenAt` is, so nothing has to sweep the collection to mark people
 * offline — a background job doing that is what usually turns presence into a
 * database problem.
 */
export interface PresenceDocument extends Document {
  userId: mongoose.Types.ObjectId;
  lastSeenAt: Date;
  /** start of the current uninterrupted stretch of activity */
  sessionStartedAt: Date;
  /** running total for `activeDate`, reset when the UTC day rolls over */
  activeMsToday: number;
  /** YYYY-MM-DD in UTC */
  activeDate: string;
}

const presenceSchema = new Schema<PresenceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    lastSeenAt: { type: Date, required: true },
    sessionStartedAt: { type: Date, required: true },
    activeMsToday: { type: Number, default: 0 },
    activeDate: { type: String, required: true },
  },
  // no timestamps and no version key: these documents are written on a timer,
  // so every byte and every field we do not need is overhead per write
  { timestamps: false, versionKey: false }
);

const PresenceModel = mongoose.model<PresenceDocument>(
  "Presence",
  presenceSchema
);

export default PresenceModel;
