import { useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Mail,
  User,
  Star,
  Zap,
  RefreshCw,
  Play,
  X,
  Linkedin,
  Instagram,
  Facebook,
  Users,
  ExternalLink,
  Phone,
  MapPin,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const AGENT_URL = import.meta.env.VITE_AGENT_URL || "https://rabix-agent.duckdns.org";

type LeadStage = "qualified" | "approved" | "disqualified" | "outreached" | "converted";

interface QualifiedLead {
  id: string;
  score: number;
  service_fit: string;
  fit_reason: string;
  outreach_angle: string;
  stage: LeadStage;
  created_at: string;
  raw_leads: {
    company_name: string;
    website: string;
    category: string;
    city: string;
    country: string;
    rating: number;
    reviews_count: number;
    phone: string;
    address: string;
    scrape_query: string;
  };
  enriched_leads: {
    decision_maker_name: string;
    decision_maker_role: string;
    decision_maker_linkedin: string;
    verified_email: string;
    email_confidence: number;
    email_is_personal: boolean;
    works_digitally: boolean;
    uses_ai_tools: boolean;
    ai_tools_found: string[];
    website_summary: string;
    services_offered: string;
    estimated_employees: number;
    tech_stack: string[];
    instagram_url: string;
    facebook_url: string;
    linkedin_company_url: string;
  };
}

const scoreColor = (score: number) => {
  if (score >= 80) return "text-success bg-success/10";
  if (score >= 60) return "text-warning bg-warning/10";
  return "text-destructive bg-destructive/10";
};

const serviceBadge: Record<string, string> = {
  audit: "bg-blue-500/10 text-blue-500",
  training: "bg-emerald-500/10 text-emerald-500",
  custom: "bg-purple-500/10 text-purple-500",
  disqualified: "bg-muted text-muted-foreground",
  tbd: "bg-muted text-muted-foreground",
};

const serviceLabel: Record<string, string> = {
  audit: "AI Audit",
  training: "AI Training",
  custom: "Custom System",
  disqualified: "Disqualified",
  tbd: "TBD",
};

const confidenceColor = (c: number) => {
  if (c > 70) return "bg-emerald-500/10 text-emerald-500";
  if (c >= 40) return "bg-yellow-500/10 text-yellow-500";
  return "bg-destructive/10 text-destructive";
};

export default function LeadInbox() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [scrapeOpen, setScrapeOpen] = useState(false);
  const [scrapeForm, setScrapeForm] = useState({ query: "", city: "", country: "Pakistan", max_results: 30 });
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isJobRunning, setIsJobRunning] = useState(false);
  const pollRef = useRef<number | null>(null);

  const clearPolling = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
      }
    };
  }, []);

  const { data: leads = [], isLoading, error: leadsError, refetch } = useQuery({
    queryKey: ["qualified_leads"],
    queryFn: async () => {
      const url = `${AGENT_URL}/leads/qualified?limit=1000&stage=qualified`;
      console.log("Fetching qualified leads from:", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<QualifiedLead[]>;
    },
    refetchInterval: 30000,
    retry: 1,
  });

  const { data: supabaseLeads = [] } = useQuery({
    queryKey: ["supabase_qualified_leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qualified_leads")
        .select("*, raw_leads(*), enriched_leads(*)")
        .eq("stage", "qualified")
        .order("score", { ascending: false });
      if (error) throw error;
      return (data ?? []) as QualifiedLead[];
    },
  });

  const { data: approvedLeads = [] } = useQuery({
    queryKey: ["approved_leads"],
    queryFn: async () => {
      const res = await fetch(`${AGENT_URL}/leads/qualified?limit=1000&stage=approved`);
      if (!res.ok) return [];
      return res.json() as Promise<QualifiedLead[]>;
    },
  });

  const { data: rejectedLeads = [] } = useQuery({
    queryKey: ["rejected_leads"],
    queryFn: async () => {
      const res = await fetch(`${AGENT_URL}/leads/qualified?limit=1000&stage=disqualified`);
      if (!res.ok) return [];
      return res.json() as Promise<QualifiedLead[]>;
    },
  });

  const { data: stats, error: statsError } = useQuery({
    queryKey: ["agent_stats"],
    queryFn: async () => {
      const url = `${AGENT_URL}/stats`;
      console.log("Fetching agent stats from:", url);
      const res = await fetch(url);
      console.log("Response status:", res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 10000,
    retry: 1,
  });

  const approveMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await fetch(`${AGENT_URL}/leads/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qualified_lead_id: leadId, approved_by: "ammaz" }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qualified_leads"] });
      qc.invalidateQueries({ queryKey: ["approved_leads"] });
      qc.invalidateQueries({ queryKey: ["agent_stats"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await fetch(`${AGENT_URL}/leads/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qualified_lead_id: leadId }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qualified_leads"] });
      qc.invalidateQueries({ queryKey: ["rejected_leads"] });
      qc.invalidateQueries({ queryKey: ["agent_stats"] });
    },
  });

  const startScrape = async () => {
    if (isScraping || isJobRunning) return;
    setIsScraping(true);
    setFetchErrors([]);
    clearPolling();

    try {
      setJobStatus("starting...");
      const url = `${AGENT_URL}/scrape/start`;
      console.log("Starting scrape at:", url, "with body:", JSON.stringify(scrapeForm));
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scrapeForm),
      });
      console.log("Scrape response status:", res.status);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      setActiveJobId(data.job_id);
      setIsJobRunning(true);
      setJobStatus(`Running — Job ID: ${data.job_id.slice(0, 8)}...`);
      setScrapeOpen(false);

      let attempts = 0;
      // Dynamic timeout: ~7min for ≤20, ~15min for ≤50, ~25min for >50
      const maxResults = scrapeForm.max_results || 30;
      const timeoutMinutes = maxResults <= 20 ? 7 : maxResults <= 50 ? 15 : 25;
      const maxAttempts = Math.ceil((timeoutMinutes * 60) / 5);

      pollRef.current = window.setInterval(async () => {
        try {
          attempts += 1;
          const statusRes = await fetch(`${AGENT_URL}/scrape/status/${data.job_id}`);
          if (!statusRes.ok) throw new Error(`Status HTTP ${statusRes.status}`);
          const s = await statusRes.json();

          if (s.status === "completed") {
            setJobStatus(`✓ Done — ${s.leads_qualified || 0} leads qualified`);
            clearPolling();
            setIsJobRunning(false);
            setActiveJobId(null);
            refetch();
            qc.invalidateQueries({ queryKey: ["agent_stats"] });
          } else if (s.status === "failed") {
            setJobStatus(`✗ Failed: ${s.error_message || "unknown error"}`);
            clearPolling();
            setIsJobRunning(false);
            setActiveJobId(null);
          } else if (attempts >= maxAttempts) {
            setJobStatus(`⚠ Still running after ${timeoutMinutes} min. Click "Reset Session" and run again.`);
            setFetchErrors((prev) => [...prev, `[status] timeout for job ${data.job_id.slice(0, 8)}`]);
            clearPolling();
            setIsJobRunning(false);
            setActiveJobId(null);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setJobStatus(`✗ Status error: ${msg}`);
          setFetchErrors((prev) => [...prev, `[status] ${msg}`]);
          clearPolling();
          setIsJobRunning(false);
          setActiveJobId(null);
        }
      }, 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Scrape error:", msg);
      setJobStatus(`✗ Error: ${msg}`);
      setFetchErrors((prev) => [...prev, `[scrape] ${msg}`]);
      setIsJobRunning(false);
      setActiveJobId(null);
    } finally {
      setIsScraping(false);
    }
  };

  const resetScrapeSession = () => {
    clearPolling();
    setActiveJobId(null);
    setIsJobRunning(false);
    setJobStatus("Session reset. Run scrape again.");
    setFetchErrors([]);
    qc.invalidateQueries({ queryKey: ["qualified_leads"] });
    qc.invalidateQueries({ queryKey: ["approved_leads"] });
    qc.invalidateQueries({ queryKey: ["agent_stats"] });
    refetch();
  };

  const effectiveLeads = leads.length > 0 ? leads : supabaseLeads;
  const displayLeads = activeTab === "pending" ? effectiveLeads : activeTab === "approved" ? approvedLeads : activeTab === "rejected" ? rejectedLeads : [...effectiveLeads, ...approvedLeads, ...rejectedLeads];

  return (
    <div className="space-y-6">
      {/* Debug panel */}
      <div className="bg-muted border border-border rounded p-3 text-xs font-mono mb-4 space-y-1">
        <p>AGENT_URL: {AGENT_URL}</p>
        <p>Stats: {statsError ? <span className="text-destructive">ERROR: {(statsError as Error).message}</span> : stats ? <span className="text-success">OK ✓</span> : "loading..."}</p>
        <p>Leads: {leadsError ? <span className="text-destructive">ERROR: {(leadsError as Error).message}</span> : leads.length > 0 ? <span className="text-success">{leads.length} loaded ✓</span> : "none"}</p>
        {fetchErrors.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            <p className="text-destructive font-bold">Recent errors:</p>
            {fetchErrors.map((e, i) => <p key={i} className="text-destructive">{e}</p>)}
          </div>
        )}
      </div>

      {/* Header stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Scraped", value: stats?.total_scraped ?? "—", color: "text-foreground" },
          { label: "Qualified", value: stats?.total_qualified ?? "—", color: "text-primary" },
          { label: "Pending Review", value: stats?.pending_approval ?? leads.length, color: "text-warning" },
          { label: "Approved", value: stats?.approved ?? approvedLeads.length, color: "text-success" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                activeTab === tab ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              {tab === "pending" ? `Pending (${leads.length})` : tab === "approved" ? `Approved (${approvedLeads.length})` : tab === "rejected" ? `Rejected (${rejectedLeads.length})` : "All"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {jobStatus && (
            <span className="text-xs text-muted-foreground">{jobStatus}</span>
          )}
          {(isJobRunning || activeJobId) && (
            <button
              onClick={resetScrapeSession}
              className="px-3 py-1.5 text-xs font-medium rounded border border-border bg-card hover:bg-accent"
              title="Reset current scrape session"
            >
              Reset Session
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-accent rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setScrapeOpen(true)}
            disabled={isScraping || isJobRunning}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {isScraping ? "Starting..." : isJobRunning ? "Job Running..." : "Run Scrape"}
          </button>
        </div>
      </div>

      {/* Agent not running notice */}
      {!stats && !isLoading && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-sm text-warning">
          ⚠️ Agent API not reachable. Deploy the VPS agent first, then set VITE_AGENT_URL in your environment.
          Leads scraped directly will still appear here once the agent is running.
        </div>
      )}

      {/* Lead cards */}
      {isLoading ? (
        <p className="text-muted-foreground text-center py-12">Loading leads...</p>
      ) : displayLeads.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Zap className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">No leads yet</p>
          <p className="text-sm text-muted-foreground">Run a scrape to start filling your inbox</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayLeads.map((lead) => {
            const raw = lead.raw_leads;
            const enrich = lead.enriched_leads;
            const isExpanded = expanded === lead.id;
            const isPending = lead.stage === "qualified";

            return (
              <div key={lead.id} className={`border border-border rounded-lg overflow-hidden ${lead.stage === "disqualified" ? "bg-muted/50 opacity-75" : "bg-card"}`}>
                {/* Row */}
                <div className="flex items-center gap-4 px-4 py-3">
                  {/* Circular Score */}
                  <div className="relative flex-shrink-0 h-10 w-10">
                    <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.915" fill="none"
                        stroke={lead.score >= 80 ? "hsl(var(--success))" : lead.score >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
                        strokeWidth="3"
                        strokeDasharray={`${lead.score} ${100 - lead.score}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{lead.score}</span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">{raw?.company_name}</span>
                      {raw?.rating && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-warning fill-warning" />
                          {raw.rating} ({raw.reviews_count})
                        </span>
                      )}
                    </div>
                    {enrich?.website_summary && (
                      <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">{enrich.website_summary}</p>
                    )}
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      {raw?.category && <span>{raw.category}</span>}
                      {raw?.city && <span>📍 {raw.city}, {raw?.country}</span>}
                      {raw?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {raw.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Service badge */}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${serviceBadge[lead.service_fit] || serviceBadge.tbd}`}>
                    {serviceLabel[lead.service_fit] || lead.service_fit}
                  </span>

                  {/* Stage badge for approved */}
                  {lead.stage === "approved" && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-success/10 text-success">
                      Approved ✓
                    </span>
                  )}
                  {lead.stage === "disqualified" && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Rejected
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {isPending && (
                      <>
                        <button
                          onClick={() => rejectMutation.mutate(lead.id)}
                          disabled={rejectMutation.isPending}
                          className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </button>
                        <button
                          onClick={() => approveMutation.mutate(lead.id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success text-xs font-medium rounded hover:bg-success/20 transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : lead.id)}
                      className="p-1.5 hover:bg-accent rounded transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-4">
                    {/* Contact Info Row */}
                    <div className="flex items-center gap-4 flex-wrap text-sm">
                      {raw?.phone && (
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {raw.phone}
                        </span>
                      )}
                      {raw?.address && (
                        <span className="flex items-center gap-1.5 text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {raw.address}
                        </span>
                      )}
                    </div>

                    {/* Decision Maker */}
                    {enrich?.decision_maker_name && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Decision Maker</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                              <User className="h-3.5 w-3.5" />
                              {enrich.decision_maker_name}
                            </span>
                            {enrich.decision_maker_role && (
                              <span className="text-xs text-muted-foreground ml-5">{enrich.decision_maker_role}</span>
                            )}
                          </div>
                          {enrich.decision_maker_linkedin && (
                            <a href={enrich.decision_maker_linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                              <Linkedin className="h-3 w-3" /> LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Email with confidence */}
                    {enrich?.verified_email && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Email</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1.5 text-sm text-foreground">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            {enrich.verified_email}
                          </span>
                          {enrich.email_confidence != null && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${confidenceColor(enrich.email_confidence)}`}>
                              {enrich.email_confidence}% confidence
                            </span>
                          )}
                          {enrich.email_is_personal === true && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">Personal</span>
                          )}
                          {enrich.email_is_personal === false && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Generic</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social Links as icon buttons */}
                    <div className="flex items-center gap-2">
                      {raw?.website && (
                        <a href={raw.website} target="_blank" rel="noreferrer" className="p-2 rounded bg-muted hover:bg-accent transition-colors" title="Website">
                          <Globe className="h-4 w-4 text-foreground" />
                        </a>
                      )}
                      {enrich?.instagram_url && (
                        <a href={enrich.instagram_url} target="_blank" rel="noreferrer" className="p-2 rounded bg-muted hover:bg-accent transition-colors" title="Instagram">
                          <Instagram className="h-4 w-4 text-foreground" />
                        </a>
                      )}
                      {enrich?.facebook_url && (
                        <a href={enrich.facebook_url} target="_blank" rel="noreferrer" className="p-2 rounded bg-muted hover:bg-accent transition-colors" title="Facebook">
                          <Facebook className="h-4 w-4 text-foreground" />
                        </a>
                      )}
                      {enrich?.linkedin_company_url && (
                        <a href={enrich.linkedin_company_url} target="_blank" rel="noreferrer" className="p-2 rounded bg-muted hover:bg-accent transition-colors" title="Company LinkedIn">
                          <Linkedin className="h-4 w-4 text-foreground" />
                        </a>
                      )}
                      {enrich?.decision_maker_linkedin && (
                        <a href={enrich.decision_maker_linkedin} target="_blank" rel="noreferrer" className="p-2 rounded bg-primary/10 hover:bg-primary/20 transition-colors" title="Decision Maker LinkedIn">
                          <User className="h-4 w-4 text-primary" />
                        </a>
                      )}
                    </div>

                    {/* Company Intelligence */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Company Intelligence</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {enrich?.estimated_employees != null && (
                          <span className="flex items-center gap-1 text-sm text-foreground">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            ~{enrich.estimated_employees} employees
                          </span>
                        )}
                        {enrich?.uses_ai_tools === true && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">⚠ Uses AI tools</span>
                        )}
                        {enrich?.uses_ai_tools === false && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">✓ No AI detected</span>
                        )}
                        <span className="text-sm">
                          {enrich?.works_digitally ? "✓ Digital business" : "✗ Unclear if digital"}
                        </span>
                      </div>
                      {enrich?.tech_stack && enrich.tech_stack.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          <span className="text-xs text-muted-foreground">Tech:</span>
                          {enrich.tech_stack.map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Why they fit */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Why they fit</p>
                      <p className="text-sm text-foreground">{lead.fit_reason}</p>
                    </div>

                    {/* Suggested Outreach — collapsible */}
                    {lead.outreach_angle && (
                      <details className="group">
                        <summary className="text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
                          Suggested Outreach <ChevronDown className="h-3 w-3 inline ml-0.5 group-open:rotate-180 transition-transform" />
                        </summary>
                        <p className="text-sm text-foreground italic mt-1.5 pl-2 border-l-2 border-primary/30">
                          "{lead.outreach_angle}"
                        </p>
                      </details>
                    )}

                    {/* Business summary */}
                    {enrich?.website_summary && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Business summary</p>
                        <p className="text-sm text-foreground">{enrich.website_summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Scrape modal */}
      {scrapeOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">Run New Scrape</p>
              <button onClick={() => setScrapeOpen(false)} className="p-1.5 hover:bg-accent rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Search Query *</label>
                <input
                  value={scrapeForm.query}
                  onChange={(e) => setScrapeForm((f) => ({ ...f, query: e.target.value }))}
                  placeholder="e.g. digital marketing agencies"
                  className="w-full h-9 px-3 mt-1 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">City</label>
                  <input
                    value={scrapeForm.city}
                    onChange={(e) => setScrapeForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Lahore"
                    className="w-full h-9 px-3 mt-1 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Country</label>
                  <input
                    value={scrapeForm.country}
                    onChange={(e) => setScrapeForm((f) => ({ ...f, country: e.target.value }))}
                    placeholder="Pakistan"
                    className="w-full h-9 px-3 mt-1 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Max Results</label>
                <select
                  value={scrapeForm.max_results}
                  onChange={(e) => setScrapeForm((f) => ({ ...f, max_results: Number(e.target.value) }))}
                  className="w-full h-9 px-3 mt-1 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary"
                >
                  <option value={20}>20 leads (fast, ~5 min)</option>
                  <option value={50}>50 leads (~12 min)</option>
                  <option value={100}>100 leads (~25 min)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setScrapeOpen(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button onClick={startScrape} disabled={isScraping || isJobRunning} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50">
                {isScraping ? "Starting..." : isJobRunning ? "Job Running..." : "Start Scraping"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
