import { useState } from "react";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DialogShell, { OptionalChip } from "@/components/resuable/dialog-shell";
import VisibilityPicker from "@/components/resuable/visibility-picker";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { createMeetingMutationFn, updateMeetingMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { MeetingType, VisibilityType } from "@/types/api.type";

/** <input type="datetime-local"> wants local wall time, not an ISO Z string. */
const toLocalInput = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

/** Remounted per meeting by the wrapper below - see the note in NoteForm. */
const MeetingForm = ({
  meeting,
  defaultDay,
  onClose,
}: {
  meeting?: MeetingType;
  defaultDay?: Date;
  onClose: () => void;
}) => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const isEditing = !!meeting;

  const { user } = useAuthContext();
  const { data: memberData } = useGetWorkspaceMembers(workspaceId);
  // You are always able to see your own item, and the server strips you out of
  // sharedWith - so listing yourself here would let the count on screen
  // disagree with what actually gets saved.
  const members = (memberData?.members || [])
    .map((m) => m.userId)
    .filter((m) => m._id !== user?._id);

  const defaults = (() => {
    if (meeting) {
      return {
        title: meeting.title,
        description: meeting.description ?? "",
        startAt: toLocalInput(new Date(meeting.startAt)),
        endAt: toLocalInput(new Date(meeting.endAt)),
        meetingLink: meeting.meetingLink ?? "",
        location: meeting.location ?? "",
        visibility: meeting.visibility,
        sharedWith: meeting.sharedWith.map((u) => u._id),
      };
    }
    // one hour long, on the next round hour of whichever day was clicked
    const start = defaultDay ? new Date(defaultDay) : new Date();
    start.setHours(start.getHours() + 1, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    return {
      title: "",
      description: "",
      startAt: toLocalInput(start),
      endAt: toLocalInput(end),
      meetingLink: "",
      location: "",
      visibility: "PRIVATE" as VisibilityType,
      sharedWith: [] as string[],
    };
  })();

  const [title, setTitle] = useState(defaults.title);
  const [description, setDescription] = useState(defaults.description);
  const [startAt, setStartAt] = useState(defaults.startAt);
  const [endAt, setEndAt] = useState(defaults.endAt);
  const [meetingLink, setMeetingLink] = useState(defaults.meetingLink);
  const [location, setLocation] = useState(defaults.location);
  const [visibility, setVisibility] = useState<VisibilityType>(
    defaults.visibility,
  );
  const [sharedWith, setSharedWith] = useState<string[]>(defaults.sharedWith);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({ mutationFn: createMeetingMutationFn });
  const updateMutation = useMutation({ mutationFn: updateMeetingMutationFn });
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (isPending) return;

    if (!title.trim()) return setError("Give the meeting a title.");
    if (!startAt || !endAt) return setError("Set a start and an end time.");
    if (new Date(endAt) <= new Date(startAt)) {
      return setError("The meeting must end after it starts.");
    }
    if (meetingLink && !/^https?:\/\//i.test(meetingLink.trim())) {
      return setError("The join link must start with http:// or https://");
    }
    setError(null);

    const data = {
      title: title.trim(),
      description: description.trim(),
      // the inputs are local time; the API stores UTC
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      meetingLink: meetingLink.trim(),
      location: location.trim(),
      visibility,
      sharedWith: visibility === "SHARED" ? sharedWith : [],
    };

    const onSuccess = (message: string) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", workspaceId] });
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
        { workspaceId, meetingId: meeting._id, data },
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
      eyebrow={isEditing ? "Edit meeting" : "New meeting"}
      title={isEditing ? "Update this meeting" : "Schedule a meeting"}
      description="Add a join link so everyone can get in with one click."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="m-title" className="text-sm font-medium">
            Title
          </Label>
          <Input
            id="m-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sprint planning"
            className="!h-11"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="m-start" className="text-sm font-medium">
              Starts
            </Label>
            <Input
              id="m-start"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="!h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-end" className="text-sm font-medium">
              Ends
            </Label>
            <Input
              id="m-end"
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="!h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="m-link" className="text-sm font-medium">
              Join link
            </Label>
            <OptionalChip />
          </div>
          <Input
            id="m-link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/abc-defg-hij"
            className="!h-11"
          />
          <p className="text-xs text-muted-foreground">
            Meet, Zoom, Teams — anything with an https link.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="m-loc" className="text-sm font-medium">
              Location
            </Label>
            <OptionalChip />
          </div>
          <Input
            id="m-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Meeting room 2, or Remote"
            className="!h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="m-desc" className="text-sm font-medium">
              Agenda
            </Label>
            <OptionalChip />
          </div>
          <Textarea
            id="m-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are we covering?"
            className="resize-none"
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

        {error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : null}

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
            {isEditing ? "Save changes" : "Schedule meeting"}
          </Button>
        </div>
      </div>
    </DialogShell>
  );
};

const MeetingDialog = ({
  meeting,
  defaultDay,
  isOpen,
  onClose,
}: {
  meeting?: MeetingType;
  /** the day the user clicked in the calendar, used when creating */
  defaultDay?: Date;
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Dialog modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="!flex max-h-[85dvh] flex-col gap-0 overflow-hidden border-0 !p-0 sm:max-w-[600px]">
      {isOpen ? (
        <MeetingForm
          key={meeting?._id ?? "new-" + (defaultDay?.toISOString() ?? "")}
          meeting={meeting}
          defaultDay={defaultDay}
          onClose={onClose}
        />
      ) : null}
    </DialogContent>
  </Dialog>
);

export default MeetingDialog;
