import {
  Send,
  MessageCircle,
  Phone,
  CheckCircle,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { contacts, activities, meetings, pipelineStages } from "@/data/mockData";
import { getChannelIcon, getChannelColorClass, getServiceLabel } from "@/lib/crm-utils";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total Outreach", value: "47", sub: "+12 this week", subColor: "text-success", icon: Send },
  { label: "Replies", value: "13", sub: "27% response rate", subColor: "text-muted-foreground", icon: MessageCircle },
  { label: "Calls Booked", value: "5", sub: "2 this week", subColor: "text-success", icon: Phone },
  { label: "Closed", value: "2", sub: "$3,200 revenue", subColor: "text-primary", icon: CheckCircle },
];

const followUps = contacts
  .filter((c) => c.followUpDate && c.pipelineStage !== "closed-won" && c.pipelineStage !== "closed-lost")
  .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
  .slice(0, 5);

const todayMeetings = meetings.filter((m) => m.date === "2026-02-27");

export default function Dashboard() {
  const stageCounts = pipelineStages.map((stage) => ({
    ...stage,
    count: contacts.filter((c) => c.pipelineStage === stage.id).length,
  }));
  const totalInPipeline = contacts.length;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-6 relative"
          >
            <stat.icon className="absolute top-5 right-5 h-5 w-5 text-muted-foreground/40" />
            <p className="stat-number">{stat.value}</p>
            <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
            <p className={`text-xs mt-1 ${stat.subColor}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-5 gap-4">
        {/* Pipeline Overview */}
        <div className="col-span-3 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Active Pipeline</h3>
            <Link
              to="/pipeline"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              View Pipeline <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stageCounts.map((stage) => {
              const color = `hsl(var(--${stage.color}))`;
              return (
                <div key={stage.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-sm text-foreground w-32">{stage.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: color,
                        width: `${totalInPipeline ? (stage.count / totalInPipeline) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-6 text-right">
                    {stage.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="col-span-2 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Today's Schedule</h3>
            <Link
              to="/calendar"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              View Calendar <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {todayMeetings.length > 0 ? (
            <div className="space-y-3">
              {todayMeetings.map((meeting) => {
                const Icon = getChannelIcon(meeting.channel);
                return (
                  <div
                    key={meeting.id}
                    className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg"
                  >
                    <div className="text-sm font-semibold text-foreground w-12 shrink-0">
                      {meeting.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {meeting.contactName}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {meeting.type} Call · {meeting.duration}min
                      </p>
                    </div>
                    <Icon className={`h-4 w-4 shrink-0 ${getChannelColorClass(meeting.channel)}`} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No meetings today</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-5 gap-4">
        {/* Recent Activity */}
        <div className="col-span-3 bg-card border border-border rounded-lg p-6">
          <h3 className="section-title mb-5">Recent Activity</h3>
          <div className="space-y-3">
            {activities.slice(0, 7).map((activity) => {
              const Icon = getChannelIcon(activity.channel);
              return (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-accent shrink-0`}>
                    <Icon className={`h-3.5 w-3.5 ${getChannelColorClass(activity.channel)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {activity.description}{" "}
                      <span className="font-medium">{activity.contactName}</span>
                      <span className="text-muted-foreground"> · {activity.company}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {activity.timeAgo}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Follow-ups Due */}
        <div className="col-span-2 bg-card border border-border rounded-lg p-6">
          <h3 className="section-title mb-5">Follow-ups Due</h3>
          <div className="space-y-3">
            {followUps.map((contact) => {
              const isOverdue = contact.followUpDate < "2026-02-27";
              const isToday = contact.followUpDate === "2026-02-27";
              return (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{contact.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        isOverdue
                          ? "bg-destructive/10 text-destructive"
                          : isToday
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {isOverdue ? "Overdue" : isToday ? "Today" : contact.followUpDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
