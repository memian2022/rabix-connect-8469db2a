import { useState } from "react";
import { Search, Bell, Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Channel, ContactStatus, ServiceInterest, PipelineStage, Priority } from "@/types/crm";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/pipeline": "Pipeline",
  "/contacts": "Contacts",
  "/calendar": "Calendar",
  "/outreach": "Outreach",
  "/reports": "Reports",
  "/workspace": "Workspace",
  "/settings": "Settings",
};

const countries = ["Pakistan", "Saudi Arabia", "UAE", "USA", "Other"];
const sources = ["Sales Navigator", "Instagram", "Referral", "Inbound", "Other"];

export default function AppHeader() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    jobTitle: "",
    country: "Pakistan",
    linkedin: "",
    whatsapp: "",
    email: "",
    instagram: "",
    source: "Sales Navigator",
    channel: "linkedin" as Channel,
    serviceInterest: "tbd" as ServiceInterest,
    pipelineStage: "outreach-sent" as PipelineStage,
    priority: "medium" as Priority,
    notes: "",
    followUpDate: "",
  });

  const resetForm = () =>
    setForm({
      firstName: "", lastName: "", company: "", jobTitle: "", country: "Pakistan",
      linkedin: "", whatsapp: "", email: "", instagram: "", source: "Sales Navigator",
      channel: "linkedin", serviceInterest: "tbd", pipelineStage: "outreach-sent",
      priority: "medium", notes: "", followUpDate: "",
    });

  const handleSave = () => {
    // TODO: persist contact
    setOpen(false);
    resetForm();
  };

  const inputCls = "w-full h-10 px-3 bg-background border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";
  const selectCls = inputCls;
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contacts, deals, companies..."
              className="w-full h-10 pl-10 pr-4 bg-accent border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-accent rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              3
            </span>
          </button>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 h-9 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>

          <span className="text-sm text-muted-foreground">
            {format(new Date(), "MMM d, yyyy")}
          </span>
        </div>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>Fill in the details to create a new contact.</DialogDescription>
          </DialogHeader>

          {/* Basic Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Basic Info</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>First Name</label>
                <input className={inputCls} placeholder="First name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input className={inputCls} placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Company</label>
              <input className={inputCls} placeholder="Company name" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Job Title</label>
                <input className={inputCls} placeholder="Job title" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <select className={selectCls} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Contact Channels */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Contact Channels</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>LinkedIn URL</label>
                <input className={inputCls} placeholder="linkedin.com/in/..." value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp</label>
                <input className={inputCls} placeholder="+92..." value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} placeholder="email@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Instagram</label>
                <input className={inputCls} placeholder="@handle" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <select className={selectCls} value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Deal Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Deal Info</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Initial Channel</label>
                <select className={selectCls} value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value as Channel }))}>
                  <option value="linkedin">LinkedIn</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Service Interest</label>
                <select className={selectCls} value={form.serviceInterest} onChange={e => setForm(f => ({ ...f, serviceInterest: e.target.value as ServiceInterest }))}>
                  <option value="audit">AI Audit ($1,500)</option>
                  <option value="training">AI Training ($8k-12k)</option>
                  <option value="custom">Custom Systems ($15k-50k)</option>
                  <option value="tbd">TBD</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Pipeline Stage</label>
                <select className={selectCls} value={form.pipelineStage} onChange={e => setForm(f => ({ ...f, pipelineStage: e.target.value as PipelineStage }))}>
                  <option value="outreach-sent">Outreach Sent</option>
                  <option value="replied">Replied</option>
                  <option value="call-booked">Call Booked</option>
                  <option value="discovery-done">Discovery Done</option>
                  <option value="proposal-sent">Proposal Sent</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select className={selectCls} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea className={inputCls + " h-20 py-2 resize-none"} placeholder="Any notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Follow-up */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Follow-up</h4>
            <div>
              <label className={labelCls}>Follow-up Date</label>
              <input type="date" className={inputCls} value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
