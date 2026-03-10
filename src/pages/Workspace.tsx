import { useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import {
  Plus, Trash2, Pin, PinOff, Check, ChevronDown, ChevronRight,
  Globe, ExternalLink, Upload, Download,
  FileText, FileImage, FileSpreadsheet, File, X,
} from "lucide-react";
import {
  useWorkspaceTasks, useCreateTask, useUpdateTask, useDeleteTask,
  useWorkspaceNotes, useCreateNote, useUpdateNote, useDeleteNote,
  useWorkspaceLinks, useCreateLink, useDeleteLink,
  useWeeklyFocus, useUpdateWeeklyFocus,
  type WorkspaceFile as WFile,
} from "@/hooks/useWorkspace";

// ── Priority helpers ──────────────────────────────
const priorityDotColor: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-primary",
  low: "bg-muted-foreground/40",
};
const priorityCycle: Record<string, string> = { high: "medium", medium: "low", low: "high" };

// ── Note colors ───────────────────────────────────
const noteBorderColor: Record<string, string> = {
  yellow: "border-l-warning",
  blue: "border-l-stage-outreach",
  green: "border-l-success",
  red: "border-l-destructive",
};
const allNoteColors = ["yellow", "blue", "green", "red"] as const;
const noteColorDot: Record<string, string> = {
  yellow: "bg-warning",
  blue: "bg-stage-outreach",
  green: "bg-success",
  red: "bg-destructive",
};

// ── File icon helper ──────────────────────────────
function FileIcon({ type }: { type: string }) {
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
  // ── Data from Supabase ─────────────────────────
  const { data: tasks = [], isLoading: loadingTasks } = useWorkspaceTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const { data: notes = [], isLoading: loadingNotes } = useWorkspaceNotes();
  const createNote = useCreateNote();
  const updateNoteMut = useUpdateNote();
  const deleteNoteMut = useDeleteNote();

  const { data: links = [], isLoading: loadingLinks } = useWorkspaceLinks();
  const createLink = useCreateLink();
  const deleteLinkMut = useDeleteLink();

  const { data: weeklyFocus = "", isLoading: loadingFocus } = useWeeklyFocus();
  const updateFocus = useUpdateWeeklyFocus();

  // ── Local UI state ─────────────────────────────
  const [newTaskText, setNewTaskText] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");

  const [addingLink, setAddingLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkCategory, setNewLinkCategory] = useState<"tools" | "research" | "clients" | "social" | "other">("other");

  const [localFiles, setLocalFiles] = useState<WFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localFocus, setLocalFocus] = useState<string | null>(null);
  const focusTimeout = useRef<ReturnType<typeof setTimeout>>();

  const displayFocus = localFocus ?? weeklyFocus;

  // ── Derived ────────────────────────────────────
  const activeTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  // ── Handlers ───────────────────────────────────
  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    createTask.mutate({ text: newTaskText.trim(), done: false, priority: "medium" });
    setNewTaskText("");
  };

  const handleAddNote = () => {
    createNote.mutate({
      title: "Untitled Note",
      content: "",
      color: "yellow",
      pinned: false,
      date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    createLink.mutate({
      title: newLinkTitle.trim() || newLinkUrl.trim(),
      url: newLinkUrl.trim(),
      category: newLinkCategory,
    });
    setNewLinkUrl("");
    setNewLinkTitle("");
    setNewLinkCategory("other");
    setAddingLink(false);
  };

  const handleFocusChange = useCallback((val: string) => {
    setLocalFocus(val);
    if (focusTimeout.current) clearTimeout(focusTimeout.current);
    focusTimeout.current = setTimeout(() => {
      updateFocus.mutate(val);
    }, 800);
  }, [updateFocus]);

  // Note debounce for title/content
  const noteDebounce = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const handleNoteUpdate = (id: string, updates: Record<string, any>) => {
    if (noteDebounce.current[id]) clearTimeout(noteDebounce.current[id]);
    noteDebounce.current[id] = setTimeout(() => {
      updateNoteMut.mutate({ id, updates });
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      let fileType: WFile["file_type"] = "other";
      if (ext === "pdf") fileType = "pdf";
      else if (["doc", "docx"].includes(ext)) fileType = "doc";
      else if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) fileType = "image";
      else if (["xls", "xlsx", "csv"].includes(ext)) fileType = "spreadsheet";
      setLocalFiles((prev) => [...prev, {
        id: `f${Date.now()}-${f.name}`,
        name: f.name,
        upload_date: format(new Date(), "yyyy-MM-dd"),
        file_size: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
        file_type: fileType,
      }]);
    });
    e.target.value = "";
  };

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

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              className="flex-1 h-9 px-3 bg-accent/50 border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <button onClick={handleAddTask} disabled={createTask.isPending} className="h-9 px-3 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          {loadingTasks ? (
            <p className="text-sm text-muted-foreground text-center py-6">Loading tasks...</p>
          ) : (
            <>
              <div className="space-y-1">
                {activeTasks.length === 0 && completedTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Plan your day. Add your first task.</p>
                )}
                {activeTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-accent/30 transition-colors group">
                    <button onClick={() => updateTask.mutate({ id: task.id, updates: { done: true } })} className="w-[18px] h-[18px] rounded border-2 border-border hover:border-primary flex items-center justify-center shrink-0 transition-colors" />
                    {editingTaskId === task.id ? (
                      <input
                        autoFocus
                        value={editingTaskText}
                        onChange={(e) => setEditingTaskText(e.target.value)}
                        onBlur={() => {
                          updateTask.mutate({ id: task.id, updates: { text: editingTaskText } });
                          setEditingTaskId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateTask.mutate({ id: task.id, updates: { text: editingTaskText } });
                            setEditingTaskId(null);
                          }
                        }}
                        className="flex-1 text-sm bg-transparent border-b border-primary text-foreground focus:outline-none"
                      />
                    ) : (
                      <span onClick={() => { setEditingTaskId(task.id); setEditingTaskText(task.text); }} className="flex-1 text-sm text-foreground cursor-text">{task.text}</span>
                    )}
                    <button onClick={() => updateTask.mutate({ id: task.id, updates: { priority: priorityCycle[task.priority] as any } })} className={`w-2.5 h-2.5 rounded-full shrink-0 ${priorityDotColor[task.priority]}`} title={`Priority: ${task.priority}`} />
                    <button onClick={() => deleteTask.mutate(task.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-accent rounded transition-all">
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>

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
                          <button onClick={() => updateTask.mutate({ id: task.id, updates: { done: false } })} className="w-[18px] h-[18px] rounded border-2 border-primary bg-primary flex items-center justify-center shrink-0">
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </button>
                          <span className="flex-1 text-sm text-muted-foreground line-through">{task.text}</span>
                          <button onClick={() => deleteTask.mutate(task.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-accent rounded transition-all">
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Notes ────────────────────────────────── */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Notes</h3>
            <button onClick={handleAddNote} disabled={createNote.isPending} className="flex items-center gap-1.5 h-8 px-3 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">
              <Plus className="h-3.5 w-3.5" /> New Note
            </button>
          </div>

          {loadingNotes ? (
            <p className="text-sm text-muted-foreground text-center py-6">Loading notes...</p>
          ) : sortedNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No notes yet. Create your first note.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sortedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdate={(updates) => {
                    // Instant updates (color, pin) go immediately
                    if ('color' in updates || 'pinned' in updates) {
                      updateNoteMut.mutate({ id: note.id, updates });
                    } else {
                      handleNoteUpdate(note.id, updates);
                    }
                  }}
                  onDelete={() => deleteNoteMut.mutate(note.id)}
                />
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

          {addingLink && (
            <div className="mb-4 p-3 bg-accent/30 border border-border rounded space-y-2">
              <input type="url" placeholder="https://..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="w-full h-8 px-3 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
              <input type="text" placeholder="Custom title (optional)" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="w-full h-8 px-3 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
              <div className="flex gap-1.5 flex-wrap">
                {(["tools", "research", "clients", "social", "other"] as const).map((cat) => (
                  <button key={cat} onClick={() => setNewLinkCategory(cat)} className={`text-[11px] px-2 py-0.5 rounded capitalize transition-colors ${newLinkCategory === cat ? categoryColors[cat] + " font-medium" : "bg-muted/50 text-muted-foreground"}`}>{cat}</button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleAddLink} className="h-7 px-3 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">Save</button>
                <button onClick={() => { setAddingLink(false); setNewLinkUrl(""); setNewLinkTitle(""); }} className="h-7 px-3 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-accent transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {loadingLinks ? (
            <p className="text-sm text-muted-foreground text-center py-6">Loading links...</p>
          ) : links.length === 0 && !addingLink ? (
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
                    <button onClick={() => deleteLinkMut.mutate(link.id)} className="p-1 hover:bg-accent rounded">
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── My Files (local only for now) ────────── */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">My Files</h3>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 h-8 px-3 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">
              <Upload className="h-3.5 w-3.5" /> Upload
            </button>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.svg,.xls,.xlsx,.csv" onChange={handleFileUpload} className="hidden" />
          </div>

          {localFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Upload files you reference regularly</p>
          ) : (
            <div className="space-y-1">
              {localFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 px-2 py-2.5 rounded hover:bg-accent/30 transition-colors group">
                  <FileIcon type={file.file_type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">{file.upload_date} · {file.file_size}</p>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Download">
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => setLocalFiles((prev) => prev.filter((f) => f.id !== file.id))} className="p-1.5 hover:bg-accent rounded transition-colors opacity-0 group-hover:opacity-100" title="Delete">
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
          {loadingFocus ? (
            <p className="text-sm text-muted-foreground py-4">Loading...</p>
          ) : (
            <textarea
              value={displayFocus}
              onChange={(e) => handleFocusChange(e.target.value)}
              placeholder="What are your 3 main goals this week?"
              rows={5}
              className="w-full text-sm text-foreground bg-transparent resize-none focus:outline-none leading-relaxed border border-transparent hover:border-border focus:border-primary rounded p-2 transition-colors"
            />
          )}
          <p className="text-[10px] text-muted-foreground/50 text-right mt-1">{displayFocus.split(/\s+/).filter(Boolean).length} words</p>
        </div>
      </div>
    </div>
  );
}

// ── Note Card Component ───────────────────────────
function NoteCard({ note, onUpdate, onDelete }: {
  note: { id: string; title: string; content: string; color: string; pinned: boolean; date: string };
  onUpdate: (updates: Record<string, any>) => void;
  onDelete: () => void;
}) {
  const [localTitle, setLocalTitle] = useState(note.title);
  const [localContent, setLocalContent] = useState(note.content);

  return (
    <div className={`bg-accent/20 border border-border rounded p-4 border-l-[3px] ${noteBorderColor[note.color]} relative group`}>
      {/* Top actions */}
      <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onUpdate({ pinned: !note.pinned })} className="p-1 hover:bg-accent rounded" title={note.pinned ? "Unpin" : "Pin"}>
          {note.pinned ? <PinOff className="h-3 w-3 text-muted-foreground" /> : <Pin className="h-3 w-3 text-muted-foreground" />}
        </button>
        <button onClick={onDelete} className="p-1 hover:bg-accent rounded" title="Delete">
          <Trash2 className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
      {note.pinned && <Pin className="h-3 w-3 text-muted-foreground/50 absolute top-3 right-3 group-hover:opacity-0" />}

      {/* Color dots at bottom right on hover */}
      <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {allNoteColors.map((c) => (
          <button
            key={c}
            onClick={() => onUpdate({ color: c })}
            className={`w-3 h-3 rounded-full ${noteColorDot[c]} transition-transform hover:scale-125 ${note.color === c ? "ring-1 ring-offset-1 ring-foreground/30" : ""}`}
            title={c}
          />
        ))}
      </div>

      <input
        value={localTitle}
        onChange={(e) => { setLocalTitle(e.target.value); onUpdate({ title: e.target.value }); }}
        className="text-sm font-semibold text-foreground bg-transparent w-full focus:outline-none focus:border-b focus:border-primary mb-2 pr-8"
      />
      <textarea
        value={localContent}
        onChange={(e) => { setLocalContent(e.target.value); onUpdate({ content: e.target.value }); }}
        rows={3}
        className="text-xs text-muted-foreground bg-transparent w-full resize-none focus:outline-none leading-relaxed"
      />
      <p className="text-[10px] text-muted-foreground/60 mt-2">{note.date}</p>
    </div>
  );
}
