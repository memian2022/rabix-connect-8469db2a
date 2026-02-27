import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Plus, X, Search } from "lucide-react";
import { useCreateContact } from "@/hooks/useSupabase";
import type { Contact } from "@/types/crm";

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

const defaultForm = {
  firstName: "",
  lastName: "",
  company: "",
  jobTitle: "",
  country: "",
  email: "",
  whatsapp: "",
  linkedin: "",
  instagram: "",
  source: "Manual",
  channel: "linkedin" as Contact["channel"],
  status: "prospect" as Contact["status"],
  serviceInterest: "tbd" as Contact["serviceInterest"],
  pipelineStage: "outreach-sent" as Contact["pipelineStage"],
  priority: "medium" as Contact["priority"],
  notes: "",
};

export default function AppHeader() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Rabix CRM";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const createContact = useCreateContact();

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.company.trim()) {
      setError("First name, last name, and company are required.");
      return;
    }
    setError("");
    try {
      await createContact.mutateAsync({
        ...form,
        lastContact: new Date().toISOString().split("T")[0],
        followUpDate: "",
        daysInStage: 0,
        discoveryForm: { state: "not-sent" },
        auditReports: [],
      });
      setOpen(false);
      setForm(defaultForm);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save. Check Supabase connection.");
    }
  };

  const inp = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full h-8 px-3 bg-background border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
      />
    </div>
  );

  const sel = (label: string, key: keyof typeof form, options: { label: string; value: string }[]) => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <select
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full h-8 px-3 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

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
            onClick={() => { setOpen(true); setError(""); }}
            className="flex items-center gap-2 h-9 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>

          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl w-full max-w-[560px] max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Add New Contact</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-accent rounded">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {inp("First Name *", "firstName", "text", "John")}
                {inp("Last Name *", "lastName", "text", "Smith")}
              </div>

              {inp("Company *", "company", "text", "Acme Corp")}

              <div className="grid grid-cols-2 gap-3">
                {inp("Job Title", "jobTitle", "text", "CEO / Founder")}
                {inp("Country", "country", "text", "Pakistan")}
              </div>

              {inp("Email", "email", "email", "john@company.com")}

              <div className="grid grid-cols-2 gap-3">
                {inp("WhatsApp", "whatsapp", "text", "+92 300 1234567")}
                {inp("LinkedIn URL", "linkedin", "text", "linkedin.com/in/...")}
              </div>

              {inp("Instagram", "instagram", "text", "@handle")}

              <div className="grid grid-cols-2 gap-3">
                {sel("Primary Channel", "channel", [
                  { label: "LinkedIn", value: "linkedin" },
                  { label: "WhatsApp", value: "whatsapp" },
                  { label: "Email", value: "email" },
                  { label: "Instagram", value: "instagram" },
                ])}
                {sel("Source", "source", [
                  { label: "Manual", value: "Manual" },
                  { label: "Sales Navigator", value: "Sales Navigator" },
                  { label: "Google Maps", value: "Google Maps" },
                  { label: "Instagram", value: "Instagram" },
                  { label: "Facebook", value: "Facebook" },
                  { label: "Referral", value: "Referral" },
                  { label: "Inbound", value: "Inbound" },
                ])}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {sel("Status", "status", [
                  { label: "Prospect", value: "prospect" },
                  { label: "Lead", value: "lead" },
                  { label: "Client", value: "client" },
                  { label: "Lost", value: "lost" },
                ])}
                {sel("Service Interest", "serviceInterest", [
                  { label: "TBD", value: "tbd" },
                  { label: "AI Audit", value: "audit" },
                  { label: "AI Training", value: "training" },
                  { label: "Custom Systems", value: "custom" },
                ])}
                {sel("Priority", "priority", [
                  { label: "High", value: "high" },
                  { label: "Medium", value: "medium" },
                  { label: "Low", value: "low" },
                ])}
              </div>

              {sel("Pipeline Stage", "pipelineStage", [
                { label: "Outreach Sent", value: "outreach-sent" },
                { label: "Replied", value: "replied" },
                { label: "Call Booked", value: "call-booked" },
                { label: "Discovery Done", value: "discovery-done" },
                { label: "Proposal Sent", value: "proposal-sent" },
                { label: "Closed Won", value: "closed-won" },
                { label: "Closed Lost", value: "closed-lost" },
              ])}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                <textarea
                  placeholder="Any notes about this contact..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">* Required fields</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createContact.isPending}
                  className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createContact.isPending ? "Saving..." : "Add Contact"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
