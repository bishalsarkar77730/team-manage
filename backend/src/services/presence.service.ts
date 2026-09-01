import mongoose from "mongoose";
import MemberModel from "../models/member.model";
import PresenceModel from "../models/presence.model";

/**
 * At most one database write per user per this window, however many requests
 * they make. This is the main reason presence costs almost nothing: a user
 * hammering the task table still produces ~2 writes a minute.
 */
export const PRESENCE_WRITE_THROTTLE_MS = 30 * 1000;

/**
 * A user reads as online if they were seen within this window. Must stay
 * comfortably above the client heartbeat interval (60s) so ordinary network
 * jitter never makes someone flicker offline.
 */
export const PRESENCE_ONLINE_WINDOW_MS = 150 * 1000;

/**
 * A gap longer than this means the user was away rather than idle-but-present:
 * it ends the session and contributes nothing to active time.
 */
const PRESENCE_SESSION_GAP_MS = 5 * 60 * 1000;

/**
 * Per-process throttle ledger. Bounded by the number of users who have made a
 * request to *this* instance, and entries are overwritten rather than
 * accumulated, so it does not grow without limit in any practical sense. With
 * N app instances the worst case is N writes per window per user.
 */
const lastWriteAt = new Map<string, number>();

export const utcDay = (date: Date) => date.toISOString().slice(0, 10);

/**
 * The update pipeline, exported so it can be exercised in isolation — the
 * accumulation rules are easy to get subtly wrong and a mistake would silently
 * skew the numbers rather than throw.
 */
export const buildPresenceUpdatePipeline = (at: Date) => {
  const today = utcDay(at);

  return [
    {
      // How long since we last saw them. A gap wider than the session window
      // counts as zero: they were away, not working.
      $set: {
        _gapMs: {
          $let: {
            vars: {
              since: { $subtract: [at, { $ifNull: ["$lastSeenAt", at] }] },
            },
            in: {
              $cond: [
                { $gt: ["$$since", PRESENCE_SESSION_GAP_MS] },
                0,
                { $max: ["$$since", 0] },
              ],
            },
          },
        },
      },
    },
    {
      $set: {
        lastSeenAt: at,
        activeDate: today,
        activeMsToday: {
          $add: [
            {
              // drop the running total when the UTC day has changed
              $cond: [
                { $eq: [{ $ifNull: ["$activeDate", today] }, today] },
                { $ifNull: ["$activeMsToday", 0] },
                0,
              ],
            },
            "$_gapMs",
          ],
        },
        sessionStartedAt: {
          // a zero gap means either a brand new document or a returning user,
          // and both start a fresh session
          $cond: [
            { $eq: ["$_gapMs", 0] },
            at,
            { $ifNull: ["$sessionStartedAt", at] },
          ],
        },
      },
    },
    { $unset: "_gapMs" },
  ];
};

/**
 * Record that a user is active. Cheap by design and safe to call on every
 * authenticated request.
 */
export const touchPresence = async (userId: string) => {
  const now = Date.now();
  const previous = lastWriteAt.get(userId);

  if (previous !== undefined && now - previous < PRESENCE_WRITE_THROTTLE_MS) {
    return; // throttled — no database traffic at all
  }
  lastWriteAt.set(userId, now);

  // A single atomic pipeline update rather than read-then-write, so two
  // concurrent requests from the same user cannot double-count active time.
  await PresenceModel.updateOne(
    { userId: new mongoose.Types.ObjectId(userId) },
    buildPresenceUpdatePipeline(new Date(now)),
    { upsert: true }
  );
};

export type MemberPresence = {
  userId: string;
  online: boolean;
  lastSeenAt: string | null;
  sessionStartedAt: string | null;
  activeMsToday: number;
};

/**
 * Presence for everyone in a workspace, in two lean queries and a tiny
 * payload. Kept separate from the member listing so the client can poll this
 * often while names and roles stay cached indefinitely.
 */
export const getWorkspacePresenceService = async (
  workspaceId: string
): Promise<{ presence: MemberPresence[]; onlineWindowMs: number }> => {
  const members = await MemberModel.find({ workspaceId }, { userId: 1 }).lean();
  const userIds = members.map((member) => member.userId);

  const records = await PresenceModel.find(
    { userId: { $in: userIds } },
    { userId: 1, lastSeenAt: 1, sessionStartedAt: 1, activeMsToday: 1, _id: 0 }
  ).lean();

  const byUser = new Map(
    records.map((record) => [String(record.userId), record])
  );
  const cutoff = Date.now() - PRESENCE_ONLINE_WINDOW_MS;

  const presence = userIds.map((userId) => {
    const record = byUser.get(String(userId));
    const lastSeen = record?.lastSeenAt ?? null;

    return {
      userId: String(userId),
      online: !!lastSeen && lastSeen.getTime() > cutoff,
      lastSeenAt: lastSeen ? lastSeen.toISOString() : null,
      sessionStartedAt: record?.sessionStartedAt
        ? record.sessionStartedAt.toISOString()
        : null,
      activeMsToday: record?.activeMsToday ?? 0,
    };
  });

  return { presence, onlineWindowMs: PRESENCE_ONLINE_WINDOW_MS };
};
