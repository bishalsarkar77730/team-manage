import { useState } from "react";
import { Loader } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DialogShell from "@/components/resuable/dialog-shell";
import RichTextEditor from "@/components/ui/rich-text-editor";
import VisibilityPicker from "@/components/resuable/visibility-picker";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { createNoteMutationFn, updateNoteMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { NoteType, VisibilityType } from "@/types/api.type";

/**
 * The form is a separate component so the dialog can remount it per note via
 * `key`. Every field then initialises from props during render, instead of
 * being synced in by an effect - the effect version fires setState on open,
 * which is both a cascading render and a lint error.
 */
const NoteForm = ({
  note,
  onClose,
}: {
  note?: NoteType;
  onClose: () => void;
}) => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const isEditing = !!note;

  const { user } = useAuthContext();
  const { data: memberData } = useGetWorkspaceMembers(workspaceId);
  // You are always able to see your own item, and the server strips you out of
  // sharedWith - so listing yourself here would let the count on screen
  // disagree with what actually gets saved.
  const members = (memberData?.members || [])
    .map((m) => m.userId)
    .filter((m) => m._id !== user?._id);

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [visibility, setVisibility] = useState<VisibilityType>(
    note?.visibility ?? "PRIVATE",
  );
  const [sharedWith, setSharedWith] = useState<string[]>(
    (note?.sharedWith ?? []).map((u) => u._id),
  );
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({ mutationFn: createNoteMutationFn });
  const updateMutation = useMutation({ mutationFn: updateNoteMutationFn });
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (isPending) return;
    if (!title.trim()) {
      setError("Give the note a title.");
      return;
    }
    setError(null);

    const data = {
      title: title.trim(),
      content,
      visibility,
      sharedWith: visibility === "SHARED" ? sharedWith : [],
    };

    const onSuccess = (message: string) => {
      queryClient.invalidateQueries({ queryKey: ["notes", workspaceId] });
      toast({ title: "Success", description: message, variant: "success" });
      onClose();
    };
    const onError = (err: Error) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });

    if (isEditing) {
      updateMutation.mutate(
        { workspaceId, noteId: note._id, data },
        { onSuccess: (res) => onSuccess(res.message), onError },
      );
    } else {
      createMutation.mutate(
        { workspaceId, data },
        { onSuccess: (res) => onSuccess(res.message), onError },
      );
    }
  };

  return (
    <DialogShell
      eyebrow={isEditing ? "Edit note" : "New note"}
      title={isEditing ? "Update this note" : "Write a note"}
      description="Only you can see it unless you choose to share it with specific members."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="note-title" className="text-sm font-medium">
            Title
          </Label>
          <Input
            id="note-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sprint retro takeaways"
            className="!h-11"
          />
          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Content</Label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Start typing. Use the toolbar for headings, lists and links…"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Who can see this</Label>
          <VisibilityPicker
            visibility={visibility}
            onVisibilityChange={setVisibility}
            sharedWith={sharedWith}
            onSharedWithChange={setSharedWith}
            members={members}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="h-11 sm:h-10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="h-11 font-medium sm:h-10"
          >
            {isPending && <Loader className="animate-spin" />}
            {isEditing ? "Save changes" : "Create note"}
          </Button>
        </div>
      </div>
    </DialogShell>
  );
};

const NoteDialog = ({
  note,
  isOpen,
  onClose,
}: {
  /** absent = creating */
  note?: NoteType;
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Dialog modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="!flex max-h-[85dvh] flex-col gap-0 overflow-hidden border-0 !p-0 sm:max-w-[640px]">
      {/* key remounts the form per note so its fields re-initialise cleanly */}
      {isOpen ? (
        <NoteForm key={note?._id ?? "new"} note={note} onClose={onClose} />
      ) : null}
    </DialogContent>
  </Dialog>
);

export default NoteDialog;
