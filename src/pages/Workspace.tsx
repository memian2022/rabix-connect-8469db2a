import { useState, useRef } from "react";
import { format } from "date-fns";
import {
  Plus,
  Trash2,
  Pin,
  PinOff,
  Check,
  ChevronDown,
  ChevronRight,
  Globe,
  ExternalLink,
  Upload,
  Download,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────
interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: "high" | "medium" | "low";
}

interface Note {
  id: string;
  title: string;
  content: string;
  color: "yellow" | "blue" | "green" | "red";
  pinned: boolean;
  date: string;
}

interface QuickLink {
  id: string;
  title: string;
  url: string;
  category: "tools" | "research" | "clients" | "social" | "other";
}

interface WorkspaceFile {
  id: string;
  name: string;
  uploadDate: string;
  fileSize: string;
  fileType: "pdf" | "doc" | "image" | "spreadsheet" | "other";
}

// ── Seed data ──────────────────────────────────────
const seedTasks: Task[] = [
  { id: "t1", text: "Follow up with Ahmed Al-Rashid on training proposal", done: false, priority: "high" },
  { id: "t2", text: "Prepare discovery call agenda for Omar Farooq", done: false, priority: "medium" },
  { id: "t3", text: "Review Priya Sharma's revised training scope", done: false, priority: "high" },
  { id: "t4", text: "Send outreach batch to 5 new Sales Navigator leads", done: true, priority: "medium" },
  { id: "t5", text: "Update CRM pipeline stages for Fatima Al-Zahra", done: true, priority: "low" },
];

const seedNotes: Note[] = [
  { id: "n1", title: "AI Training Package Pricing", content: "Tier 1: 2-day workshop $8k\nTier 2: 5-day intensive $12k\nTier 3: Ongoing mentorship $15k/mo\n\nConsider adding a Tier 1.5 for 3-day option.", color: "yellow", pinned: true, date: "2026-02-26" },
  { id: "n2", title: "FTA Group Call Notes", content: "Ahmed wants training for 20+ engineers. Key concerns: timeline, hands-on labs, certification. Follow up with curriculum draft.", color: "blue", pinned: false, date: "2026-02-25" },
  { id: "n3", title: "Outreach Scripts to Test", content: "A/B test the new founding partner outreach vs. the consultative approach. Track reply rates per channel for 2 weeks.", color: "green", pinned: false, date: "2026-02-23" },
];

const seedLinks: QuickLink[] = [
  { id: "l1", title: "Sales Navigator", url: "https://www.linkedin.com/sales", category: "tools" },
  { id: "l2", title: "Calendly Booking Page", url: "https://calendly.com/rabix-ammaz", category: "tools" },
  { id: "l3", title: "AI Industry Report 2026", url: "https://example.com/ai-report-2026", category: "research" },
];

const seedFiles: WorkspaceFile[] = [
  { id: "f1", name: "Rabix Service Deck 2026.pdf", uploadDate: "2026-02-20", fileSize: "3.2 MB", fileType: "pdf" },
  { id: "f2", name: "Client ROI Calculator.xlsx", uploadDate: "2026-02-18", fileSize: "890 KB", fileType: "spreadsheet" },
];

// ── Priority helpers ──────────────────────────────
const priorityDotColor: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-primary",
  low: "bg-muted-foreground/40",
};
const priorityCycle: Record<string, Task["priority"]> = { high: "medium", medium: "low", low: "high" };

// ── Note border colors ────────────────────────────
const noteBorderColor: Record<string, string> = {
  yellow: "border-l-warning",
  blue: "border-l-stage-outreach",
  green: "border-l-success",
  red: "border-l-destructive",
};
const noteColorCycle: Record<string, Note["color"]> = { yellow: "blue", blue: "green", green: "red", red: "yellow" };

// ── File icon helper ──────────────────────────────
function FileIcon({ type }: { type: WorkspaceFile["fileType"] }) {
  switch (type) {
    case "pdf": return <FileText className="h-5 w-5 text-destructive" />;
    case "doc": return <FileText className="h-5 w-5 text-stage-outreach" />;
    case "image": return <FileImage className="h-5 w-5 text-success" />;
    case "spreadsheet": return <FileSpreadsheet className="h-5 w-5 text-success" />;
    default: return <File className="h-5 w-5 text-muted-foreground" />;
  }
}

// ── Category badges ───────────────────────────────
const categoryColors: Record<string, string> = {
  tools: "bg-stage-outreach/10 text-stage-outreach",
  research: "bg-stage-replied/10 text-stage-replied",
  clients: "bg-primary/10 text-primary",
  social: "bg-channel-instagram/10 text-channel-instagram",
  other: "bg-muted text-muted-foreground",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Workspace() {
  // ── Tasks state ─────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [newTaskText, setNewTaskText] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const activeTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: `t${Date.now()}`, text: newTaskText.trim(), done: false, priority: "medium" }]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  const cyclePriority = (id: string) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, priority: priorityCycle[t.priority] } : t)));

  const updateTaskText = (id: string, text: string) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, text } : t)));

  // ── Notes state ─────────────────────────────────
  const [notes, setNotes] = useState<Note[]>(seedNotes);

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  const addNote = () => {
    const newNote: Note = {
      id: `n${Date.now()}`,
      title: "Untitled Note",
      content: "",
      color: "yellow",
      pinned: false,
      date: format(new Date(), "yyyy-MM-dd"),
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id: string, updates: Partial<Note>) =>
    setNotes(notes.map((n) => (n.id === id ? { ...n, ...updates } : n)));

  const deleteNote = (id: string) => setNotes(notes.filter((n) => n.id !== id));

  // ── Links state ─────────────────────────────────
  const [links, setLinks] = useState<QuickLink[]>(seedLinks);
  const [addingLink, setAddingLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkCategory, setNewLinkCategory] = useState<QuickLink["category"]>("other");

  const addLink = () => {
    if (!newLinkUrl.trim()) return;
    setLinks([...links, {
      id: `l${Date.now()}`,
      title: newLinkTitle.trim() || newLinkUrl.trim(),
      url: newLinkUrl.trim(),
      category: newLinkCategory,
    }]);
    setNewLinkUrl("");
    setNewLinkTitle("");
    setNewLinkCategory("other");
    setAddingLink(false);
  };

  const deleteLink = (id: string) => setLinks(links.filter((l) => l.id !== id));

  // ── Files state ─────────────────────────────────
  const [files, setFiles] = useState<WorkspaceFile[]>(seedFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      let fileType: WorkspaceFile["fileType"] = "other";
      if (ext === "pdf") fileType = "pdf";
      else if (["doc", "docx"].includes(ext)) fileType = "doc";
      else if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) fileType = "image";
      else if (["xls", "xlsx", "csv"].includes(ext)) fileType = "spreadsheet";
      setFiles((prev) => [...prev, {
        id: `f${Date.now()}-${f.name}`,
        name: f.name,
        uploadDate: format(new Date(), "yyyy-MM-dd"),
        fileSize: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
        fileType,
      }]);
    });
    e.target.value = "";
  };

  const deleteFile = (id: string) => setFiles(files.filter((f) => f.id !== id));

  // ── Weekly focus state ──────────────────────────
  const [weeklyFocus, setWeeklyFocus] = useState("1. Close the InnovateTech training deal\n2. Book 3 new discovery calls\n3. Finalize AI Audit report template");

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="flex gap-6">
      {/* ── LEFT COLUMN (65%) ──────────────────────── */}
      <div className="flex-[65] min-w-0 space-y-6">
        {/* ── Today's Plan ─────────────────────────── */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Today's Plan</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(), "EEEE, MMMM d")}</p>
            </div>
          </div>

          {/* Add task input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1 h-9 px-3 bg-accent/50 border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <button onClick={addTask} className="h-9 px-3 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          {/* Active tasks */}
          <div className="space-y-1">
            {activeTasks.length === 0 && completedTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Plan your day. Add your first task.</p>
            )}
            {activeTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-accent/30 transition-colors group">
                <button onClick={() => toggleTask(task.id)} className="w-4.5 h-4.5 rounded border-2 border-border hover:border-primary flex items-center justify-center shrink-0 transition-colors" style={{ width: 18, height: 18 }}>
                  {/* empty */}
                </button>
                {editingTaskId === task.id ? (
                  <input
                    autoFocus
                    value={task.text}
                    onChange={(e) => updateTaskText(task.id, e.target.value)}
                    onBlur={() => setEditingTaskId(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingTaskId(null)}
                    className="flex-1 text-sm bg-transparent border-b border-primary text-foreground focus:outline-none"
                  />
                ) : (
                  <span onClick={() => setEditingTaskId(task.id)} className="flex-1 text-sm text-foreground cursor-text">{task.text}</span>
                )}
                <button onClick={() => cyclePriority(task.id)} className={`w-2.5 h-2.5 rounded-full shrink-0 ${priorityDotColor[task.priority]}`} title={`Priority: ${task.priority}`} />
                <button onClick={() => deleteTask(task.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-accent rounded transition-all">
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <button onClick={() => setShowCompleted(!showCompleted)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {showCompleted ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {completedTasks.length} completed today
              </button>
              {showCompleted && (
                <div className="mt-2 space-y-1">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-accent/30 transition-colors group">
                      <button onClick={() => toggleTask(task.id)} className="w-[18px] h-[18px] rounded border-2 border-primary bg-primary flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      </button>
                      <span className="flex-1 text-sm text-muted-foreground line-through">{task.text}</span>
                      <button onClick={() => deleteTask(task.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-accent rounded transition-all">
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Notes ────────────────────────────────── */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Notes</h3>
            <button onClick={addNote} className="flex items-center gap-1.5 h-8 px-3 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">
              <Plus className="h-3.5 w-3.5" /> New Note
            </button>
          </div>

          {sortedNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No notes yet. Create your first note.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sortedNotes.map((note) => (
                <div key={note.id} className={`bg-accent/20 border border-border rounded p-4 border-l-[3px] ${noteBorderColor[note.color]} relative group`}>
                  {/* Top actions */}
                  <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => updateNote(note.id, { color: noteColorCycle[note.color] })} className="p-1 hover:bg-accent rounded" title="Change color">
                      <div className={`w-3 h-3 rounded-full ${noteBorderColor[noteColorCycle[note.color]].replace("border-l-", "bg-")}`} />
                    </button>
                    <button onClick={() => updateNote(note.id, { pinned: !note.pinned })} className="p-1 hover:bg-accent rounded" title={note.pinned ? "Unpin" : "Pin"}>
                      {note.pinned ? <PinOff className="h-3 w-3 text-muted-foreground" /> : <Pin className="h-3 w-3 text-muted-foreground" />}
                    </button>
                    <button onClick={() => deleteNote(note.id)} className="p-1 hover:bg-accent rounded" title="Delete">
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                  {note.pinned && <Pin className="h-3 w-3 text-muted-foreground/50 absolute top-3 right-3 group-hover:opacity-0" />}

                  <input
                    value={note.title}
                    onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    className="text-sm font-semibold text-foreground bg-transparent w-full focus:outline-none focus:border-b focus:border-primary mb-2 pr-8"
                  />
                  <textarea
                    value={note.content}
                    onChange={(e) => updateNote(note.id, { content: e.target.value })}
                    rows={3}
                    className="text-xs text-muted-foreground bg-transparent w-full resize-none focus:outline-none leading-relaxed"
                  />
                  <p className="text-[10px] text-muted-foreground/60 mt-2">{note.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN (35%) ─────────────────────── */}
      <div className="flex-[35] min-w-0 space-y-6">
        {/* ── Quick Links ──────────────────────────── */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Quick Links</h3>
            <button onClick={() => setAddingLink(true)} className="flex items-center gap-1.5 h-8 px-3 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Link
            </button>
          </div>

          {/* Add link form */}
          {addingLink && (
            <div className="mb-4 p-3 bg-accent/30 border border-border rounded space-y-2">
              <input
                type="url"
                placeholder="https://..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="w-full h-8 px-3 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Custom title (optional)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="w-full h-8 px-3 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <div className="flex gap-1.5 flex-wrap">
                {(["tools", "research", "clients", "social", "other"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewLinkCategory(cat)}
                    className={`text-[11px] px-2 py-0.5 rounded capitalize transition-colors ${newLinkCategory === cat ? categoryColors[cat] + " font-medium" : "bg-muted/50 text-muted-foreground"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={addLink} className="h-7 px-3 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">Save</button>
                <button onClick={() => { setAddingLink(false); setNewLinkUrl(""); setNewLinkTitle(""); }} className="h-7 px-3 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {links.length === 0 && !addingLink ? (
            <p className="text-sm text-muted-foreground text-center py-6">Save important links here</p>
          ) : (
            <div className="space-y-1">
              {links.map((link) => (
                <div key={link.id} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-accent/30 transition-colors group">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{link.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize shrink-0 ${categoryColors[link.category]}`}>{link.category}</span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-accent rounded">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                    <button onClick={() => deleteLink(link.id)} className="p-1 hover:bg-accent rounded">
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── My Files ─────────────────────────────── */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">My Files</h3>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 h-8 px-3 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">
              <Upload className="h-3.5 w-3.5" /> Upload
            </button>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.svg,.xls,.xlsx,.csv" onChange={handleFileUpload} className="hidden" />
          </div>

          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Upload files you reference regularly</p>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 px-2 py-2.5 rounded hover:bg-accent/30 transition-colors group">
                  <FileIcon type={file.fileType} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">{file.uploadDate} · {file.fileSize}</p>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Download">
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => deleteFile(file.id)} className="p-1.5 hover:bg-accent rounded transition-colors opacity-0 group-hover:opacity-100" title="Delete">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Weekly Focus ─────────────────────────── */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="section-title mb-3">This Week's Focus</h3>
          <textarea
            value={weeklyFocus}
            onChange={(e) => setWeeklyFocus(e.target.value)}
            placeholder="What are your 3 main goals this week?"
            rows={5}
            className="w-full text-sm text-foreground bg-transparent resize-none focus:outline-none leading-relaxed border border-transparent hover:border-border focus:border-primary rounded p-2 transition-colors"
          />
          <p className="text-[10px] text-muted-foreground text-right mt-1">
            {weeklyFocus.trim().split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      </div>
    </div>
  );
}
