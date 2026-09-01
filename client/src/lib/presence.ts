import { format, formatDistanceToNowStrict, isSameYear } from "date-fns";

import { MemberPresenceType } from "@/types/api.type";

/** Past this, a relative distance stops being useful — show the date instead. */
const ABSOLUTE_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Compact duration for presence readouts: "<1m", "42m", "1h 42m", "3h".
 * Deliberately terser than date-fns' formatDuration, which renders this as
 * "1 hour 42 minutes" and wraps a table row.
 */
export const formatActiveDuration = (ms: number): string => {
  if (!ms || ms < 60_000) return "<1m";

  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
};

/**
 * The one-line status shown in a member row.
 *
 * Relative for the first 24 hours, because "12 minutes ago" is what you want to
 * know about someone who was just here. Absolute after that, because
 * "47 days ago" is worse than a date you can actually place.
 */
export const presenceLabel = (
  presence?: MemberPresenceType
): string | null => {
  // no entry at all means the first poll has not landed yet — say nothing,
  // rather than flashing "Never active" at every member on page load. The
  // server returns a row for every member, so once loaded this cannot be null.
  if (!presence) return null;
  if (!presence.lastSeenAt) return "Never active";
  if (presence.online) return "Active now";

  const lastSeen = new Date(presence.lastSeenAt);

  if (Date.now() - lastSeen.getTime() < ABSOLUTE_AFTER_MS) {
    return `Active ${formatDistanceToNowStrict(lastSeen, { addSuffix: true })}`;
  }

  const datePattern = isSameYear(lastSeen, new Date())
    ? "d MMM"
    : "d MMM yyyy";

  return `Active ${format(lastSeen, datePattern)}`;
};

/** The second line: time on the app today, omitted when there is none. */
export const activeTodayLabel = (
  presence?: MemberPresenceType
): string | null => {
  if (!presence || presence.activeMsToday <= 0) return null;
  return `${formatActiveDuration(presence.activeMsToday)} today`;
};

/**
 * Full detail for the hover title, including the exact timestamp — the row
 * itself stays to two short lines.
 */
export const presenceDetail = (presence?: MemberPresenceType): string => {
  if (!presence) return ""; // not loaded — no tooltip rather than a wrong one
  if (!presence.lastSeenAt) return "No activity recorded yet";

  const lines = [
    `Last active: ${format(
      new Date(presence.lastSeenAt),
      "d MMM yyyy, h:mm a"
    )}`,
  ];

  if (presence.online && presence.sessionStartedAt) {
    const sessionMs = Date.now() - new Date(presence.sessionStartedAt).getTime();
    lines.push(`In this session: ${formatActiveDuration(sessionMs)}`);
  }

  lines.push(`Active today: ${formatActiveDuration(presence.activeMsToday)}`);

  return lines.join("\n");
};
