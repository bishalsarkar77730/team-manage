/**
 * Who can see a note or a meeting.
 *
 * PRIVATE — only the person who created it.
 * SHARED  — the creator plus the specific workspace members listed in
 *           `sharedWith`. Sharing is opt-in and per item, never workspace-wide,
 *           so an owner or admin cannot see someone's private notes.
 */
export const VisibilityEnum = {
  PRIVATE: "PRIVATE",
  SHARED: "SHARED",
} as const;

export type VisibilityEnumType = keyof typeof VisibilityEnum;
