import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader,
  Lock,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import PageHeader from "@/components/resuable/page-header";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import MeetingDialog from "@/components/workspace/meeting/meeting-dialog";
import {
  CalendarView,
  DayView,
  MonthView,
  WeekView,
  meetingsOn,
  rangeLabel,
  viewRange,
} from "@/components/workspace/meeting/calendar-views";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { deleteMeetingMutationFn, getMeetingsQueryFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MeetingType } from "@/types/api.type";

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
];

const Meetings = () => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MeetingType | undefined>();
  const [pendingDelete, setPendingDelete] = useState<MeetingType | null>(null);

  const { from, to } = useMemo(() => viewRange(view, anchor), [view, anchor]);

  // The calendar asks for a date window rather than a page — a month grid needs
  // every meeting in the window or days come up empty.
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["meetings", workspaceId, view, from.toISOString(), to.toISOString()],
    queryFn: () =>
      getMeetingsQueryFn({
        workspaceId,
        from: from.toISOString(),
        to: to.toISOString(),
      }),
    enabled: !!workspaceId,
    placeholderData: keepPreviousData,
  });

  const meetings = data?.meetings || [];
  const deleteMutation = useMutation({ mutationFn: deleteMeetingMutationFn });

  const step = (direction: 1 | -1) => {
    if (view === "month") return setAnchor((d) => addMonths(d, direction));
    if (view === "week") return setAnchor((d) => addDays(d, 7 * direction));
    setAnchor((d) => addDays(d, direction));
  };

  const goToday = () => {
    const today = startOfDay(new Date());
    setAnchor(today);
    setSelectedDay(today);
  };

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };
  const openEdit = (meeting: MeetingType) => {
    setEditing(meeting);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(
      { workspaceId, meetingId: pendingDelete._id },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: ["meetings", workspaceId] });
          toast({ title: "Deleted", description: res.message, variant: "success" });
          setPendingDelete(null);
        },
        onError: (err) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
          setPendingDelete(null);
        },
      }
    );
  };

  const dayMeetings = meetingsOn(meetings, selectedDay);

  return (
    <div className="w-full py-4 md:pt-3">
      <PageHeader
        eyebrow="Personal"
        title="My meetings"
        description="Private by default. Share a meeting with named members and add a join link."
        actions={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus />
            New meeting
          </Button>
        }
      />

      {/* toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous"
              onClick={() => step(-1)}
              className="size-8 rounded-r-none"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span aria-hidden="true" className="h-5 w-px bg-border" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next"
              onClick={() => step(1)}
              className="size-8 rounded-l-none"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={goToday}>
            Today
          </Button>
          <h2 className="ml-1 truncate text-sm font-semibold tracking-tight sm:text-base">
            {rangeLabel(view, anchor)}
          </h2>
          {isFetching ? (
            <Loader className="size-3.5 animate-spin text-muted-foreground" />
          ) : null}
        </div>

        <div className="flex items-center gap-1 self-start rounded-md border p-0.5 sm:self-auto">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setView(v.value)}
              aria-pressed={view === v.value}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                view === v.value
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          {isLoading ? (
            <div className="flex justify-center rounded-lg border py-24">
              <Loader className="size-7 animate-spin text-muted-foreground" />
            </div>
          ) : view === "month" ? (
            <MonthView
              anchor={anchor}
              meetings={meetings}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onSelectMeeting={openEdit}
            />
          ) : view === "week" ? (
            <WeekView
              anchor={anchor}
              meetings={meetings}
              onSelectMeeting={openEdit}
            />
          ) : (
            <DayView
              anchor={anchor}
              meetings={meetings}
              onSelectMeeting={openEdit}
            />
          )}
        </div>

        {/* day detail — the month grid can only show two chips per cell */}
        <aside className="min-w-0 rounded-lg border p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {isSameDay(selectedDay, new Date()) ? "Today" : "Selected day"}
          </p>
          <h3 className="mt-1 text-sm font-semibold tracking-tight">
            {format(selectedDay, "EEEE d MMMM")}
          </h3>

          {dayMeetings.length === 0 ? (
            <div className="py-8 text-center">
              <CalendarDays
                aria-hidden="true"
                className="mx-auto mb-2 size-6 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">Nothing scheduled</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setEditing(undefined);
                  setDialogOpen(true);
                }}
              >
                <Plus className="size-3.5" />
                Add one
              </Button>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {dayMeetings.map((meeting) => {
                const isOwner = meeting.userId?._id === user?._id;
                return (
                  <li key={meeting._id} className="rounded-md border p-3">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
                        {meeting.title}
                      </p>
                      {isOwner ? (
                        <div className="flex shrink-0 items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit meeting"
                            onClick={() => openEdit(meeting)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete meeting"
                            onClick={() => setPendingDelete(meeting)}
                            className="size-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
                      <Clock className="size-3" />
                      {format(new Date(meeting.startAt), "HH:mm")}&ndash;
                      {format(new Date(meeting.endAt), "HH:mm")}
                    </p>

                    {meeting.location ? (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        {meeting.location}
                      </p>
                    ) : null}

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {meeting.visibility === "SHARED" ? (
                        <>
                          <Users className="size-3" />
                          Shared with {meeting.sharedWith.length}
                        </>
                      ) : (
                        <>
                          <Lock className="size-3" />
                          Only me
                        </>
                      )}
                    </p>

                    {meeting.meetingLink ? (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="mt-3 h-8 w-full"
                      >
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="size-3.5" />
                          Join
                        </a>
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>

      <MeetingDialog
        meeting={editing}
        defaultDay={selectedDay}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        isLoading={deleteMutation.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this meeting?"
        description={`"${pendingDelete?.title}" will be removed permanently. This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Meetings;
