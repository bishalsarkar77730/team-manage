import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { cn } from "@/lib/utils";
import { MeetingType } from "@/types/api.type";

export type CalendarView = "month" | "week" | "day";

/** Week starts Monday, matching the rest of the app's date formatting. */
const WEEK_OPTS = { weekStartsOn: 1 as const };

export const viewRange = (view: CalendarView, anchor: Date) => {
  if (view === "day") {
    return { from: startOfDay(anchor), to: addDays(startOfDay(anchor), 1) };
  }
  if (view === "week") {
    return {
      from: startOfWeek(anchor, WEEK_OPTS),
      to: addDays(endOfWeek(anchor, WEEK_OPTS), 1),
    };
  }
  // a month grid shows leading/trailing days, so the query must cover them too
  return {
    from: startOfWeek(startOfMonth(anchor), WEEK_OPTS),
    to: addDays(endOfWeek(endOfMonth(anchor)), 1),
  };
};

export const rangeLabel = (view: CalendarView, anchor: Date) => {
  if (view === "day") return format(anchor, "EEEE d MMMM yyyy");
  if (view === "week") {
    const from = startOfWeek(anchor, WEEK_OPTS);
    const to = endOfWeek(anchor, WEEK_OPTS);
    const sameMonth = isSameMonth(from, to);
    return `${format(from, sameMonth ? "d" : "d MMM")} – ${format(
      to,
      "d MMM yyyy",
    )}`;
  }
  return format(anchor, "MMMM yyyy");
};

const meetingsOn = (meetings: MeetingType[], day: Date) =>
  meetings
    .filter((m) => {
      const start = new Date(m.startAt);
      const end = new Date(m.endAt);
      // a meeting spanning midnight belongs on both days
      return (
        isSameDay(start, day) ||
        isSameDay(end, day) ||
        (start < day && end > addDays(day, 1))
      );
    })
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));

const Chip = ({
  meeting,
  onSelect,
  showTime = true,
}: {
  meeting: MeetingType;
  onSelect: (m: MeetingType) => void;
  showTime?: boolean;
}) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onSelect(meeting);
    }}
    title={`${format(new Date(meeting.startAt), "HH:mm")} ${meeting.title}`}
    className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] leading-tight transition-colors bg-primary/10 text-foreground hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
  >
    <span
      aria-hidden="true"
      className="size-1.5 shrink-0 rounded-full bg-primary"
    />
    {showTime ? (
      <span className="shrink-0 font-medium tabular-nums">
        {format(new Date(meeting.startAt), "HH:mm")}
      </span>
    ) : null}
    <span className="truncate">{meeting.title}</span>
  </button>
);

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const MonthView = ({
  anchor,
  meetings,
  selectedDay,
  onSelectDay,
  onSelectMeeting,
}: {
  anchor: Date;
  meetings: MeetingType[];
  selectedDay: Date;
  onSelectDay: (d: Date) => void;
  onSelectMeeting: (m: MeetingType) => void;
}) => {
  const { from, to } = viewRange("month", anchor);
  const days = eachDayOfInterval({ start: from, end: addDays(to, -1) });

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d[0]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayMeetings = meetingsOn(meetings, day);
          const outside = !isSameMonth(day, anchor);
          const selected = isSameDay(day, selectedDay);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "min-h-[84px] border-b border-r p-1.5 text-left align-top transition-colors last:border-r-0 sm:min-h-[104px]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
                outside && "bg-muted/30",
                selected ? "bg-accent" : "hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                  isToday(day) &&
                    "bg-primary font-semibold text-primary-foreground",
                  !isToday(day) && outside && "text-muted-foreground/60",
                  !isToday(day) && !outside && "font-medium",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="space-y-0.5">
                {dayMeetings.slice(0, 2).map((m) => (
                  <Chip key={m._id} meeting={m} onSelect={onSelectMeeting} />
                ))}
                {dayMeetings.length > 2 ? (
                  <span className="block px-1 text-[11px] text-muted-foreground">
                    +{dayMeetings.length - 2} more
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/** 07:00–21:00 covers a working day without making the grid enormous. */
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);
const HOUR_PX = 52;

const TimeGrid = ({
  days,
  meetings,
  onSelectMeeting,
}: {
  days: Date[];
  meetings: MeetingType[];
  onSelectMeeting: (m: MeetingType) => void;
}) => {
  const top = (d: Date) =>
    ((d.getHours() - HOURS[0]) * 60 + d.getMinutes()) * (HOUR_PX / 60);

  return (
    <div className="overflow-hidden rounded-lg border">
      <div
        className="grid border-b bg-muted/40"
        style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, 1fr)` }}
      >
        <div />
        {days.map((day) => (
          <div key={day.toISOString()} className="px-2 py-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {format(day, "EEE")}
            </p>
            <p
              className={cn(
                "mx-auto mt-0.5 inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                isToday(day)
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "font-medium",
              )}
            >
              {format(day, "d")}
            </p>
          </div>
        ))}
      </div>

      <div className="max-h-[62vh] overflow-y-auto">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `3.5rem repeat(${days.length}, 1fr)`,
            height: HOURS.length * HOUR_PX,
          }}
        >
          {/* hour gutter */}
          <div className="relative border-r">
            {HOURS.map((h, i) => (
              <span
                key={h}
                className="absolute right-1.5 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground"
                style={{ top: i * HOUR_PX }}
              >
                {String(h).padStart(2, "0")}:00
              </span>
            ))}
          </div>

          {days.map((day) => {
            const dayMeetings = meetingsOn(meetings, day);
            return (
              <div
                key={day.toISOString()}
                className="relative border-r last:border-r-0"
              >
                {HOURS.map((h, i) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-b border-border/60"
                    style={{ top: i * HOUR_PX, height: HOUR_PX }}
                  />
                ))}
                {dayMeetings.map((m) => {
                  const start = new Date(m.startAt);
                  const end = new Date(m.endAt);
                  const offset = Math.max(top(start), 0);
                  const height = Math.max(
                    ((+end - +start) / 60000) * (HOUR_PX / 60),
                    22,
                  );
                  return (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => onSelectMeeting(m)}
                      className="absolute inset-x-1 overflow-hidden rounded-md border border-primary/25 bg-primary/10 px-1.5 py-1 text-left text-[11px] leading-tight transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                      style={{ top: offset, height }}
                    >
                      <span className="block truncate font-medium">
                        {m.title}
                      </span>
                      <span className="block truncate tabular-nums text-muted-foreground">
                        {format(start, "HH:mm")}–{format(end, "HH:mm")}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const WeekView = ({
  anchor,
  meetings,
  onSelectMeeting,
}: {
  anchor: Date;
  meetings: MeetingType[];
  onSelectMeeting: (m: MeetingType) => void;
}) => {
  const start = startOfWeek(anchor, WEEK_OPTS);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  // the grid needs horizontal room; below sm it scrolls rather than crushing
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <TimeGrid
          days={days}
          meetings={meetings}
          onSelectMeeting={onSelectMeeting}
        />
      </div>
    </div>
  );
};

export const DayView = ({
  anchor,
  meetings,
  onSelectMeeting,
}: {
  anchor: Date;
  meetings: MeetingType[];
  onSelectMeeting: (m: MeetingType) => void;
}) => (
  <TimeGrid
    days={[startOfDay(anchor)]}
    meetings={meetings}
    onSelectMeeting={onSelectMeeting}
  />
);

export { meetingsOn };
