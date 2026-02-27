import { useState } from "react";
import { contacts } from "@/data/mockData";
import {
  getChannelIcon,
  getChannelColorClass,
  getServiceLabel,
  getStatusLabel,
  getStageLabel,
  getInitials,
} from "@/lib/crm-utils";
import { Search, X, Mail, Phone, MessageCircle, Linkedin, Instagram, ArrowRight } from "lucide-react";
import type { Contact, ContactStatus } from "@/types/crm";

const statusFilters: { label: string; value: ContactStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Prospect", value: "prospect" },
  { label: "Lead", value: "lead" },
  { label: "Client", value: "client" },
  { label: "Lost", value: "lost" },
];

const statusColors: Record<string, string> = {
  prospect: "bg-stage-outreach/10 text-stage-outreach",
  lead: "bg-primary/10 text-primary",
  client: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [selected, setSelected] = useState<Contact | null>(null);

  const filtered = contacts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
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
    <div className="flex h-full gap-0">
      {/* Table */}
      <div className={`flex-1 flex flex-col transition-all ${selected ? "mr-[420px]" : ""}`}>
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-sm text-muted-foreground">
            {filtered.length} contacts
          </span>
          <div className="flex gap-1.5 ml-4">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  statusFilter === f.value
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
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-9 pr-3 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Last Contact</th>
                <th className="px-4 py-3 font-medium">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact, i) => {
                const ChannelIcon = getChannelIcon(contact.channel);
                return (
                  <tr
                    key={contact.id}
                    onClick={() => setSelected(contact)}
                    className={`border-t border-border hover:bg-accent/30 cursor-pointer transition-colors text-sm ${
                      selected?.id === contact.id ? "bg-accent/40" : i % 2 === 1 ? "bg-muted/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground shrink-0">
                          {getInitials(contact.firstName, contact.lastName)}
                        </div>
                        <span className="font-medium text-foreground">
                          {contact.firstName} {contact.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{contact.company}</td>
                    <td className="px-4 py-3">
                      <ChannelIcon className={`h-4 w-4 ${getChannelColorClass(contact.channel)}`} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[contact.status] || ""}`}>
                        {getStatusLabel(contact.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {getServiceLabel(contact.serviceInterest)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{contact.lastContact}</td>
                    <td className="px-4 py-3 text-xs">
                      {contact.followUpDate ? (
                        <span className={contact.followUpDate <= "2026-02-27" ? "text-destructive font-medium" : "text-muted-foreground"}>
                          {contact.followUpDate}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed right-0 top-16 bottom-0 w-[420px] bg-card border-l border-border overflow-y-auto z-40">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-secondary-foreground">
                  {getInitials(selected.firstName, selected.lastName)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selected.firstName} {selected.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selected.jobTitle} · {selected.company}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selected.country}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 hover:bg-accent rounded transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="mb-6 space-y-2">
              <h4 className="section-title mb-3">Contact Channels</h4>
              {selected.linkedin && (
                <div className="flex items-center gap-3 text-sm">
                  <Linkedin className="h-4 w-4 text-channel-linkedin" />
                  <span className="text-foreground">{selected.linkedin}</span>
                </div>
              )}
              {selected.whatsapp && (
                <div className="flex items-center gap-3 text-sm">
                  <MessageCircle className="h-4 w-4 text-channel-whatsapp" />
                  <span className="text-foreground">{selected.whatsapp}</span>
                </div>
              )}
              {selected.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-channel-email" />
                  <span className="text-foreground">{selected.email}</span>
                </div>
              )}
              {selected.instagram && (
                <div className="flex items-center gap-3 text-sm">
                  <Instagram className="h-4 w-4 text-channel-instagram" />
                  <span className="text-foreground">{selected.instagram}</span>
                </div>
              )}
            </div>

            {/* Pipeline Status */}
            <div className="mb-6">
              <h4 className="section-title mb-3">Pipeline</h4>
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">
                    {getStageLabel(selected.pipelineStage)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selected.daysInStage} days
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[selected.status]}`}>
                    {getStatusLabel(selected.status)}
                  </span>
                  <span className="text-xs border border-border px-2 py-0.5 rounded text-muted-foreground">
                    {getServiceLabel(selected.serviceInterest)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h4 className="section-title mb-3">Notes</h4>
              <p className="text-sm text-foreground leading-relaxed">
                {selected.notes}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">
                <ArrowRight className="h-3 w-3" /> Move Stage
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">
                <Phone className="h-3 w-3" /> Book Call
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">
                <Mail className="h-3 w-3" /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
