import { z } from "zod";
import { VisibilityEnum } from "../enums/visibility.enum";

export const meetingIdSchema = z.string().trim().min(1);

const isoDate = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date. Provide an ISO date string.",
  });

/**
 * Only http(s) join links. A `javascript:` or `data:` url here would be rendered
 * as an anchor for every person the meeting is shared with.
 */
const meetingLinkSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      value === "" ||
      /^https?:\/\//i.test(value),
    { message: "Meeting link must start with http:// or https://" }
  )
  .optional();

const base = {
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional(),
  startAt: isoDate,
  endAt: isoDate,
  meetingLink: meetingLinkSchema,
  location: z.string().trim().max(255).optional(),
  visibility: z
    .enum(Object.values(VisibilityEnum) as [string, ...string[]])
    .optional(),
  sharedWith: z.array(z.string().trim().min(1)).max(200).optional(),
};

/** A meeting that ends before it starts is always a mistake, so reject it. */
const endsAfterItStarts = (data: { startAt: string; endAt: string }) =>
  Date.parse(data.endAt) > Date.parse(data.startAt);

export const createMeetingSchema = z
  .object(base)
  .refine(endsAfterItStarts, {
    message: "The meeting must end after it starts",
    path: ["endAt"],
  });

export const updateMeetingSchema = z
  .object(base)
  .refine(endsAfterItStarts, {
    message: "The meeting must end after it starts",
    path: ["endAt"],
  });
