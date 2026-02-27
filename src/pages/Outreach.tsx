import { useState } from "react";
import { outreachMessages, messageTemplates } from "@/data/mockData";
import { getChannelIcon, getChannelColorClass } from "@/lib/crm-utils";
import { Search, Copy, Pencil, Trash2 } from "lucide-react";

const statusColors: Record<string, string> = {
  sent: "bg-stage-outreach/10 text-stage-outreach",
  delivered: "bg-success/10 text-success",
  replied: "bg-success/10 text-success",
  "no-response": "bg-muted text-muted-foreground",
};

export default function Outreach() {
  const [tab, setTab] = useState<"sent" | "templates">("sent");
  const [search, setSearch] = useState("");

  const filteredMessages = outreachMessages.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.contactName.toLowerCase().includes(q) || m.company.toLowerCase().includes(q);
  });

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-6 mb-6 border-b border-border">
        <button
          onClick={() => setTab("sent")}
          className={`pb-3 text-sm font-medium transition-colors ${
            tab === "sent"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sent Outreach
        </button>
        <button
          onClick={() => setTab("templates")}
          className={`pb-3 text-sm font-medium transition-colors ${
            tab === "templates"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Message Templates
        </button>
        {tab === "sent" && (
          <div className="relative ml-auto mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search outreach..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-9 pr-3 bg-card border border-border rounded text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary w-56"
            />
          </div>
        )}
      </div>

      {tab === "sent" ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Days</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((msg, i) => {
                const Icon = getChannelIcon(msg.channel);
                return (
                  <tr
                    key={msg.id}
                    className={`border-t border-border text-sm ${i % 2 === 1 ? "bg-muted/20" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{msg.contactName}</p>
                      <p className="text-xs text-muted-foreground">{msg.company}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Icon className={`h-4 w-4 ${getChannelColorClass(msg.channel)}`} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{msg.dateSent}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[250px] truncate">
                      {msg.messagePreview}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${statusColors[msg.status]}`}>
                        {msg.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{msg.daysSinceSent}d</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {messageTemplates.map((tpl) => {
            const Icon = getChannelIcon(tpl.channel);
            return (
              <div
                key={tpl.id}
                className="bg-card border border-border rounded-lg p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{tpl.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon className={`h-3.5 w-3.5 ${getChannelColorClass(tpl.channel)}`} />
                      <span className="text-xs text-muted-foreground">
                        Used {tpl.useCount} times · Last: {tpl.lastUsed}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-accent rounded transition-colors">
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-accent rounded transition-colors">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-accent rounded transition-colors">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {tpl.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
