import { useState } from "react";
import { meetings } from "@/data/mockData";
import { getChannelIcon, getChannelColorClass } from "@/lib/crm-utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

const meetingTypeColors: Record<string, string> = {
  discovery: "bg-primary/10 text-primary",
  "follow-up": "bg-stage-outreach/10 text-stage-outreach",
  proposal: "bg-warning/10 text-warning",
  demo: "bg-stage-replied/10 text-stage-replied",
  other: "bg-muted text-muted-foreground",
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // Feb 2026

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const upcomingMeetings = meetings.sort((a, b) => a.date.localeCompare(b.date));

  const getMeetingsForDay = (date: Date) =>
    meetings.filter((m) => isSameDay(new Date(m.date), date));

  return (
    <div className="flex gap-6 h-full">
      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-accent rounded transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-accent rounded transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="text-xs font-medium text-muted-foreground text-center py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 flex-1 border border-border rounded-lg overflow-hidden">
          {days.map((day, i) => {
            const dayMeetings = getMeetingsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = format(day, "yyyy-MM-dd") === "2026-02-27";
            return (
              <div
                key={i}
                className={`border-b border-r border-border p-2 min-h-[100px] ${
                  !isCurrentMonth ? "bg-muted/30" : "bg-card"
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isToday
                      ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                      : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayMeetings.map((m) => (
                    <div
                      key={m.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate ${meetingTypeColors[m.type] || meetingTypeColors.other}`}
                    >
                      {m.time} {m.contactName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right sidebar - Upcoming */}
      <div className="w-72 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Upcoming</h3>
          <button className="p-1.5 hover:bg-accent rounded transition-colors">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          {upcomingMeetings.map((meeting) => {
            const Icon = getChannelIcon(meeting.channel);
            return (
              <div
                key={meeting.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {meeting.contactName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {meeting.company}
                    </p>
                  </div>
                  <Icon className={`h-4 w-4 ${getChannelColorClass(meeting.channel)}`} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {meeting.date} · {meeting.time}
                  </span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded mt-2 inline-block capitalize ${meetingTypeColors[meeting.type] || meetingTypeColors.other}`}>
                  {meeting.type} · {meeting.duration}min
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
