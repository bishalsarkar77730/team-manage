---
tags: [feature, security]
---

# Notes

Per-user rich-text notes inside a workspace. `/workspace/:id/my-notes`.

`backend/src/services/note.service.ts`,
`client/src/page/workspace/Notes.tsx`,
`client/src/components/workspace/note/note-dialog.tsx`.

## Visibility

- `PRIVATE` — only the author
- `SHARED` — the author plus the specific members listed in `sharedWith`

The read filter is one predicate, `visibleToUser`:

```ts
{
  workspaceId,
  $or: [
    { userId },                                        // mine
    { visibility: "SHARED", sharedWith: userId },      // shared with me
  ],
}
```

There is **no owner/admin override**. An owner cannot read a member's private
notes, and that is deliberate — see [[Data Model]].

`resolveSharedWith` filters the incoming id list down to actual workspace
members before storing it. Without that, `sharedWith` is a way to leak content
to any user id the caller can guess.

Only the author may edit or delete. `sharedWith` is read-only for recipients.

## Rich text

TipTap 2 (`@tiptap/react`, `starter-kit`, `extension-placeholder`,
`extension-link`) in `components/ui/rich-text-editor.tsx`. It exports a `PROSE`
class string so the editor and the read-only rendering share exactly one set of
typographic styles — otherwise notes look different while editing.

## Storing HTML safely

Content is HTML, so it is **sanitised on the server before it is stored**, in
`backend/src/utils/sanitizeHtml.ts` — an allowlist, not a blocklist.

```ts
transformTags: {
  a: (tag, attrs) => ({ ...  // target=_blank + rel="noopener noreferrer nofollow"
}
```

> [!danger] Sanitise on write, on the server
> Client-side sanitising is bypassed by anyone calling the API directly. If you
> add a field that stores HTML, route it through `sanitizeNoteHtml` too.

## Pagination

Server-side, `{ pageSize, pageNumber }` in, `{ notes, pagination }` out. The
client uses the shared `components/resuable/pager.tsx`.

## Related

- [[Meetings]] — same visibility model, same dialog patterns
- [[Data Model]] · [[Design System]] · [[API Endpoints]]
