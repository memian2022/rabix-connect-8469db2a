import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Save, FileText, Loader2 } from "lucide-react";

const AGENT_URL = import.meta.env.VITE_AGENT_URL || "https://rabix-agent.duckdns.org";

const VARIABLE_CHIPS = [
  "{first_name}",
  "{company}",
  "{city}",
  "{outreach_angle}",
  "{service_line}",
  "{price_line}",
];

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export default function Templates() {
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, { subject: string; body: string }>>({});

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["email_templates"],
    queryFn: async () => {
      const res = await fetch(`${AGENT_URL}/templates`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<EmailTemplate[]>;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, subject, body }: { id: string; subject: string; body: string }) => {
      const res = await fetch(`${AGENT_URL}/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      if (!res.ok) throw new Error("Failed to save template");
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: "Template saved", description: `Updated successfully`, variant: "default" });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
      qc.invalidateQueries({ queryKey: ["email_templates"] });
    },
    onError: (error) => {
      toast({ title: "Save failed", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    },
  });

  const getEdit = (tpl: EmailTemplate) => edits[tpl.id] || { subject: tpl.subject, body: tpl.body };
  const hasChanges = (tpl: EmailTemplate) => {
    const edit = edits[tpl.id];
    return edit && (edit.subject !== tpl.subject || edit.body !== tpl.body);
  };

  const updateField = (id: string, tpl: EmailTemplate, field: "subject" | "body", value: string) => {
    const current = edits[id] || { subject: tpl.subject, body: tpl.body };
    setEdits((prev) => ({ ...prev, [id]: { ...current, [field]: value } }));
  };

  const insertVariable = (id: string, tpl: EmailTemplate, variable: string) => {
    const current = edits[id] || { subject: tpl.subject, body: tpl.body };
    setEdits((prev) => ({ ...prev, [id]: { ...current, body: current.body + variable } }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Manage outreach email templates used by the AI agent</p>
        </div>
      </div>

      {/* Variable chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">Available variables:</span>
        {VARIABLE_CHIPS.map((v) => (
          <span key={v} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-mono">
            {v}
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">No templates found</p>
          <p className="text-sm text-muted-foreground">Templates will appear once configured in the agent</p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((tpl) => {
            const edit = getEdit(tpl);
            const changed = hasChanges(tpl);
            return (
              <div key={tpl.id} className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">{tpl.name}</h3>
                  </div>
                  <button
                    onClick={() => saveMutation.mutate({ id: tpl.id, subject: edit.subject, body: edit.body })}
                    disabled={!changed || saveMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-colors disabled:opacity-40"
                  >
                    {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save
                  </button>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Subject</label>
                  <input
                    value={edit.subject}
                    onChange={(e) => updateField(tpl.id, tpl, "subject", e.target.value)}
                    className="mt-1 w-full h-9 px-3 bg-background border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Body</label>
                  <textarea
                    value={edit.body}
                    onChange={(e) => updateField(tpl.id, tpl, "body", e.target.value)}
                    rows={8}
                    className="mt-1 w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono leading-relaxed resize-y"
                  />
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Insert:</span>
                    {VARIABLE_CHIPS.map((v) => (
                      <button
                        key={v}
                        onClick={() => insertVariable(tpl.id, tpl, v)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-primary/10 hover:text-primary transition-colors font-mono"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
