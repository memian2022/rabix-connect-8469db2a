import { useState } from "react";
import { contacts, pipelineStages } from "@/data/mockData";
import { getChannelIcon, getChannelColorClass, getServiceLabel } from "@/lib/crm-utils";
import { ArrowRight, CalendarDays, Pencil, Search, ClipboardList, FileText } from "lucide-react";
import type { Channel } from "@/types/crm";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const channelFilters: { label: string; value: Channel | "all" }[] = [
  { label: "All", value: "all" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Email", value: "email" },
  { label: "Instagram", value: "instagram" },
];

const formStateColor: Record<string, string> = {
  "not-sent": "text-muted-foreground/40",
  sent: "text-primary",
  completed: "text-success",
};

const formStateTooltip: Record<string, string> = {
  "not-sent": "Discovery form: Not sent",
  sent: "Discovery form: Sent - Awaiting response",
  completed: "Discovery form: Completed",
};

export default function Pipeline() {
  const [filter, setFilter] = useState<Channel | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) => {
    if (filter !== "all" && c.channel !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-1.5">
          {channelFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pipeline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-9 pr-3 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-56"
          />
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {pipelineStages.map((stage) => {
            const stageContacts = filtered.filter(
              (c) => c.pipelineStage === stage.id
            );
            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 flex flex-col bg-accent/30 rounded-lg"
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <div className={`w-2.5 h-2.5 rounded-full bg-${stage.color}`} />
                  <span className="text-sm font-semibold text-foreground">
                    {stage.label}
                  </span>
                  <span className="ml-auto text-xs font-medium bg-card border border-border rounded px-1.5 py-0.5 text-muted-foreground">
                    {stageContacts.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)]">
                  {stageContacts.map((contact) => {
                    const ChannelIcon = getChannelIcon(contact.channel);
                    const hasReport = contact.auditReports.length > 0;
                    return (
                      <div
                        key={contact.id}
                        className="bg-card border border-border rounded p-4 hover:shadow-sm transition-shadow cursor-pointer border-l-[3px] group"
                        style={{
                          borderLeftColor: `hsl(var(--channel-${contact.channel}))`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contact.company}
                            </p>
                          </div>
                          <ChannelIcon
                            className={`h-4 w-4 ${getChannelColorClass(contact.channel)}`}
                          />
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[11px] px-2 py-0.5 border border-border rounded text-muted-foreground">
                            {getServiceLabel(contact.serviceInterest)}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground mb-3 truncate">
                          {contact.notes}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">
                              {contact.daysInStage}d in stage
                            </span>
                            {/* Document status indicators */}
                            <div className="flex items-center gap-1.5 ml-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <ClipboardList className={`h-3 w-3 ${formStateColor[contact.discoveryForm.state]}`} />
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                  {formStateTooltip[contact.discoveryForm.state]}
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <FileText className={`h-3 w-3 ${hasReport ? "text-success" : "text-muted-foreground/40"}`} />
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                  {hasReport ? `${contact.auditReports.length} audit report(s) attached` : "No audit report yet"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-accent rounded" title="Next stage">
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <button className="p-1 hover:bg-accent rounded" title="Book call">
                              <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <button className="p-1 hover:bg-accent rounded" title="Add note">
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {stageContacts.length === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
