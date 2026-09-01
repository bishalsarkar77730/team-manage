import { z } from "zod";
import { VisibilityEnum } from "../enums/visibility.enum";

export const noteIdSchema = z.string().trim().min(1);

const visibilitySchema = z
  .enum(Object.values(VisibilityEnum) as [string, ...string[]])
  .optional();

/**
 * Rich text arrives as HTML. It is capped and sanitised server-side (see
 * utils/sanitizeHtml) — never trust the editor to have done it, since the
 * request does not have to come from the editor at all.
 */
const contentSchema = z.string().max(100_000).optional();

const sharedWithSchema = z.array(z.string().trim().min(1)).max(200).optional();

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(255),
  content: contentSchema,
  visibility: visibilitySchema,
  sharedWith: sharedWithSchema,
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1).max(255),
  content: contentSchema,
  visibility: visibilitySchema,
  sharedWith: sharedWithSchema,
});
