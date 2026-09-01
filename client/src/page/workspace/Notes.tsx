import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { FileText, Loader, Lock, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/resuable/page-header";
import Pager from "@/components/resuable/pager";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import NoteDialog from "@/components/workspace/note/note-dialog";
import { PROSE } from "@/components/ui/rich-text-editor";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useNotes from "@/hooks/api/use-notes";
import { useAuthContext } from "@/context/auth-provider";
import { deleteNoteMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { NoteType } from "@/types/api.type";

const Notes = () => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const [pageNumber, setPageNumber] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NoteType | undefined>();
  const [pendingDelete, setPendingDelete] = useState<NoteType | null>(null);

  const { data, isLoading, isFetching } = useNotes({
    workspaceId,
    keyword: keyword || null,
    pageNumber,
  });

  const notes = data?.notes || [];
  const deleteMutation = useMutation({ mutationFn: deleteNoteMutationFn });

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };
  const openEdit = (note: NoteType) => {
    setEditing(note);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(
      { workspaceId, noteId: pendingDelete._id },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: ["notes", workspaceId] });
          toast({
            title: "Deleted",
            description: res.message,
            variant: "success",
          });
          setPendingDelete(null);
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          });
          setPendingDelete(null);
        },
      }
    );
  };

  return (
    <div className="w-full py-4 md:pt-3">
      <PageHeader
        eyebrow="Personal"
        title="My notes"
        description="Private by default. Share a note with named members when you want to."
        actions={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus />
            New note
          </Button>
        }
      />

      <div className="mt-6 max-w-md">
        <Input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPageNumber(1);
          }}
          placeholder="Search your notes…"
          className="h-9"
        />
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader className="size-7 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <FileText
              aria-hidden="true"
              className="mx-auto mb-3 size-7 text-muted-foreground"
            />
            <p className="text-sm font-medium">
              {keyword ? "No notes match that search" : "No notes yet"}
            </p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
              {keyword
                ? "Try a different word, or clear the search."
                : "Notes are yours alone until you share them."}
            </p>
            {!keyword ? (
              <Button onClick={openCreate} variant="outline" className="mt-5">
                <Plus />
                Write your first note
              </Button>
            ) : null}
          </div>
        ) : (
          notes.map((note) => {
            const isOwner = note.userId?._id === user?._id;
            const isShared = note.visibility === "SHARED";

            return (
              <article
                key={note._id}
                className="group rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20 sm:p-5"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold tracking-tight">
                      {note.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        {isShared ? (
                          <Users className="size-3" />
                        ) : (
                          <Lock className="size-3" />
                        )}
                        {isShared
                          ? `Shared with ${note.sharedWith.length}`
                          : "Only me"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Edited{" "}
                        {formatDistanceToNowStrict(new Date(note.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {!isOwner ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>by {note.userId?.name}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* only the author may change a note; a shared note is read-only */}
                  {isOwner ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit note"
                        title="Edit"
                        onClick={() => openEdit(note)}
                        className="size-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete note"
                        title="Delete"
                        onClick={() => setPendingDelete(note)}
                        className="size-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>

                {note.content ? (
                  <div
                    className={cn(
                      PROSE,
                      "mt-3 max-h-40 overflow-hidden border-t pt-3 text-muted-foreground"
                    )}
                    // sanitised server-side on write (utils/sanitizeHtml)
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                ) : null}

                {isShared && note.sharedWith.length ? (
                  <div className="mt-3 flex items-center gap-1.5 border-t pt-3">
                    {note.sharedWith.slice(0, 6).map((member) => (
                      <Avatar
                        key={member._id}
                        className="size-6"
                        title={member.name}
                      >
                        <AvatarImage src={member.profilePicture || ""} />
                        <AvatarFallback
                          className={cn(
                            "text-[10px]",
                            getAvatarColor(member.name)
                          )}
                        >
                          {getAvatarFallbackText(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {note.sharedWith.length > 6 ? (
                      <span className="text-xs text-muted-foreground">
                        +{note.sharedWith.length - 6}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>

      <div className="mt-5">
        <Pager
          pagination={data?.pagination}
          onPageChange={setPageNumber}
          isLoading={isFetching}
        />
      </div>

      <NoteDialog
        note={editing}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        isLoading={deleteMutation.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this note?"
        description={`"${pendingDelete?.title}" will be removed permanently. This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Notes;
