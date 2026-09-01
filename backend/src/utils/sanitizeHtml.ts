import sanitize from "sanitize-html";

/**
 * Note content is authored as HTML in a rich text editor, stored, and later
 * rendered back into other users' browsers — a note can be shared. That makes
 * it a stored-XSS vector, so it is sanitised here, on the way in, rather than
 * trusted because "the editor produced it": the request does not have to come
 * from the editor at all.
 *
 * The allowlist matches what the TipTap toolbar can actually produce, plus
 * links. Anything else (script, style, iframe, event handlers, javascript:
 * urls) is dropped.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "s",
  "u",
  "code",
  "pre",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "hr",
  "a",
];

export const sanitizeNoteHtml = (html: string | undefined | null): string => {
  if (!html) return "";

  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    // no data: or javascript: hrefs
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href"],
    // every surviving link opens safely
    transformTags: {
      a: sanitize.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      }),
    },
    // drop the contents of anything disallowed rather than leaking the text of
    // a <script> block into the document
    nonTextTags: ["style", "script", "textarea", "option", "noscript"],
  });
};
