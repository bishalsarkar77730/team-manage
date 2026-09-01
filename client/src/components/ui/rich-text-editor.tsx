import { useEffect } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToolbarButton = {
  icon: typeof Bold;
  label: string;
  run: (editor: Editor) => void;
  active?: (editor: Editor) => boolean;
};

const GROUPS: ToolbarButton[][] = [
  [
    {
      icon: Bold,
      label: "Bold",
      run: (e) => e.chain().focus().toggleBold().run(),
      active: (e) => e.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      run: (e) => e.chain().focus().toggleItalic().run(),
      active: (e) => e.isActive("italic"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      run: (e) => e.chain().focus().toggleStrike().run(),
      active: (e) => e.isActive("strike"),
    },
    {
      icon: Code,
      label: "Inline code",
      run: (e) => e.chain().focus().toggleCode().run(),
      active: (e) => e.isActive("code"),
    },
  ],
  [
    {
      icon: Heading2,
      label: "Heading",
      run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      active: (e) => e.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      label: "Subheading",
      run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      active: (e) => e.isActive("heading", { level: 3 }),
    },
  ],
  [
    {
      icon: List,
      label: "Bullet list",
      run: (e) => e.chain().focus().toggleBulletList().run(),
      active: (e) => e.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      run: (e) => e.chain().focus().toggleOrderedList().run(),
      active: (e) => e.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Quote",
      run: (e) => e.chain().focus().toggleBlockquote().run(),
      active: (e) => e.isActive("blockquote"),
    },
    {
      icon: Minus,
      label: "Divider",
      run: (e) => e.chain().focus().setHorizontalRule().run(),
    },
  ],
];

/**
 * Prose styling for editor content and for read-only rendering, kept in one
 * place so a saved note looks the same as it did while being written.
 * Everything is expressed in theme tokens, so it follows light/dark.
 */
export const PROSE = cn(
  "text-sm leading-relaxed",
  "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
  "[&_h2]:mb-1.5 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
  "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:my-0.5",
  "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]",
  "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_hr]:my-4 [&_hr]:border-border",
  "[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-muted-foreground/50 [&_a]:underline-offset-2",
  "[&_strong]:font-semibold"
);

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write something…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          PROSE,
          "min-h-[180px] w-full px-3 py-2.5 focus:outline-none",
          // the placeholder is rendered by the extension as a data attribute
          "[&_p.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_p.is-editor-empty:first-child::before]:float-left",
          "[&_p.is-editor-empty:first-child::before]:h-0",
          "[&_p.is-editor-empty:first-child::before]:text-muted-foreground",
          "[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
        ),
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  // When the dialog is reused for a different note, push the new content in.
  // Guarded on inequality so typing does not fight the prop.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="overflow-hidden rounded-md border border-input bg-transparent focus-within:ring-1 focus-within:ring-ring">
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-1.5 py-1.5">
        {GROUPS.map((group, index) => (
          <div key={index} className="flex items-center gap-0.5">
            {index > 0 ? (
              <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
            ) : null}
            {group.map(({ icon: Icon, label, run, active }) => (
              <Button
                key={label}
                type="button"
                variant="ghost"
                size="icon"
                title={label}
                aria-label={label}
                aria-pressed={active ? active(editor) : undefined}
                onClick={() => run(editor)}
                className={cn(
                  "size-7 text-muted-foreground hover:text-foreground",
                  active?.(editor) && "bg-accent text-foreground"
                )}
              >
                <Icon className="size-3.5" />
              </Button>
            ))}
          </div>
        ))}

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Link"
          aria-label="Link"
          onClick={setLink}
          className={cn(
            "size-7 text-muted-foreground hover:text-foreground",
            editor.isActive("link") && "bg-accent text-foreground"
          )}
        >
          <Link2 className="size-3.5" />
        </Button>

        <div className="ml-auto flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Undo"
            aria-label="Undo"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            className="size-7 text-muted-foreground hover:text-foreground"
          >
            <Undo2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Redo"
            aria-label="Redo"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            className="size-7 text-muted-foreground hover:text-foreground"
          >
            <Redo2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
