import { useState } from "react";
import { useContacts } from "@/hooks/useSupabase";
import {
  getChannelIcon,
  getChannelColorClass,
  getServiceLabel,
  getStatusLabel,
  getStageLabel,
  getInitials,
} from "@/lib/crm-utils";
import { Search, X, Mail, Phone, MessageCircle, Linkedin, Instagram, ArrowRight, FileText, Download, Trash2, Upload, Link, ClipboardCopy, Eye } from "lucide-react";
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

const formStatusBadge: Record<string, { label: string; className: string }> = {
  "not-sent": { label: "Not Sent", className: "bg-muted text-muted-foreground" },
  sent: { label: "Sent - Awaiting Response", className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
};

export default function Contacts() {
  const { data: contacts = [], isLoading } = useContacts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [detailTab, setDetailTab] = useState<"info" | "documents">("info");

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

  const handleSelect = (contact: Contact) => {
    setSelected(contact);
    setDetailTab("info");
  };

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
                    onClick={() => handleSelect(contact)}
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
            <div className="flex items-start justify-between mb-4">
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

            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b border-border">
              <button
                onClick={() => setDetailTab("info")}
                className={`pb-2.5 text-sm font-medium transition-colors ${
                  detailTab === "info"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setDetailTab("documents")}
                className={`pb-2.5 text-sm font-medium transition-colors ${
                  detailTab === "documents"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Documents
              </button>
            </div>

            {detailTab === "info" ? (
              <>
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
              </>
            ) : (
              /* Documents Tab */
              <div className="space-y-6">
                {/* Discovery Form Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground">Discovery Form</h4>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${formStatusBadge[selected.discoveryForm.state].className}`}>
                      {formStatusBadge[selected.discoveryForm.state].label}
                    </span>
                  </div>

                  {selected.discoveryForm.state === "not-sent" && (
                    <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">
                      <ClipboardCopy className="h-3 w-3" /> Send Form Link
                    </button>
                  )}

                  {selected.discoveryForm.state === "sent" && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Sent on {selected.discoveryForm.sentDate}
                      </p>
                      <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">
                        <ClipboardCopy className="h-3 w-3" /> Resend Form Link
                      </button>
                    </div>
                  )}

                  {selected.discoveryForm.state === "completed" && selected.discoveryForm.responses && (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Completed on {selected.discoveryForm.completedDate}
                      </p>
                      <div className="bg-accent/50 rounded-lg p-4 space-y-2.5">
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Company Size</p>
                          <p className="text-sm text-foreground">{selected.discoveryForm.responses.companySize}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Current Tools</p>
                          <p className="text-sm text-foreground">{selected.discoveryForm.responses.currentTools}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Main Pain Points</p>
                          <p className="text-sm text-foreground">{selected.discoveryForm.responses.painPoints}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Monthly Budget</p>
                          <p className="text-sm text-foreground">{selected.discoveryForm.responses.monthlyBudget}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">
                        <Eye className="h-3 w-3" /> View Full Responses
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Audit Reports Section */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Audit Reports</h4>

                  {selected.auditReports.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {selected.auditReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center gap-3 bg-card border border-border rounded p-3 hover:bg-accent/30 transition-colors group"
                        >
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {report.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {report.uploadDate} · {report.fileSize} · {report.fileType.toUpperCase()}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Download">
                              <Download className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button className="p-1.5 hover:bg-accent rounded transition-colors opacity-0 group-hover:opacity-100" title="Delete">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 mb-3">
                      <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No reports uploaded yet</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">
                      <Upload className="h-3 w-3" /> Upload Report
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">
                      <Link className="h-3 w-3" /> Link from Google Drive
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
