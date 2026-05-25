"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Pin, Calendar, CheckSquare, FileText, 
  Sparkles, GraduationCap, Link2, Plus, Check, Copy, Trash2, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/lib/store";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import QuickTask from "@/components/dashboard/QuickTask";
import { useHasHydrated } from "@/hooks/useHasHydrated";

type TabId = "tasks" | "notes" | "prompts" | "learning" | "resources";

interface TabOption {
  id: TabId;
  label: string;
  icon: React.ComponentType<any>;
}

const tabs: TabOption[] = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "notes", label: "Notes & Ideas", icon: FileText },
  { id: "prompts", label: "AI Prompts", icon: Sparkles },
  { id: "learning", label: "Learning", icon: GraduationCap },
  { id: "resources", label: "Resources", icon: Link2 },
];

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const hasHydrated = useHasHydrated();
  
  // Zustand Store
  const {
    projects,
    workspaces,
    updateProject,
    togglePinProject,
    deleteProject,
    
    // Actions
    addWorkspaceTask,
    toggleWorkspaceTask,
    deleteWorkspaceTask,
    
    addWorkspaceNote,
    updateWorkspaceNote,
    deleteWorkspaceNote,
    
    addWorkspacePrompt,
    updateWorkspacePrompt,
    deleteWorkspacePrompt,
    
    addWorkspaceLearning,
    toggleWorkspaceLearning,
    deleteWorkspaceLearning,
    
    addWorkspaceResource,
    updateWorkspaceResource,
    deleteWorkspaceResource,
  } = useWorkspaceStore();

  // Find project and workspace
  const project = projects.find((p) => p.slug === slug);
  const workspace = workspaces[slug];

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabId>("tasks");

  // Local Form Inputs
  const [taskText, setTaskText] = useState("");
  const [learningText, setLearningText] = useState("");
  
  // Note inputs
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [saveIndicator, setSaveIndicator] = useState("");
  const noteSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Prompt inputs
  const [promptTitle, setPromptTitle] = useState("");
  const [promptDesc, setPromptDesc] = useState("");
  const [promptContent, setPromptContent] = useState("");
  const [isAddPromptOpen, setIsAddPromptOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Resource inputs
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [isAddResOpen, setIsAddResOpen] = useState(false);

  // Redirect if project doesn't exist
  useEffect(() => {
    if (hasHydrated && !project) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [project, router, hasHydrated]);

  // Sync active note inputs
  useEffect(() => {
    if (workspace?.notes && workspace.notes.length > 0) {
      // Set first note as active if none set
      if (!activeNoteId || !workspace.notes.some(n => n.id === activeNoteId)) {
        const firstNote = workspace.notes[0];
        setActiveNoteId(firstNote.id);
        setNoteTitle(firstNote.title);
        setNoteContent(firstNote.content);
      }
    } else {
      setActiveNoteId(null);
      setNoteTitle("");
      setNoteContent("");
    }
  }, [workspace?.notes, activeNoteId]);

  if (!hasHydrated) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-24 bg-white/5 rounded-lg mb-8" />
          <div>
            <div className="h-10 w-48 bg-white/5 rounded-xl mb-4" />
            <div className="h-5 w-96 bg-white/5 rounded-xl mb-12" />
          </div>
          <div className="h-[1px] bg-white/[0.04] w-full mb-8" />
          <div className="flex gap-6 pb-4">
            <div className="h-5 w-16 bg-white/5 rounded-md" />
            <div className="h-5 w-24 bg-white/5 rounded-md" />
            <div className="h-5 w-20 bg-white/5 rounded-md" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project || !workspace) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h2 className="text-xl font-light text-slate-300">Project Not Found</h2>
          <p className="mt-2 text-sm text-slate-500 font-light">Redirecting you to the workspace dashboard...</p>
          <Link href="/" className="mt-8 text-xs font-light text-slate-400 border border-white/10 rounded-xl px-4 py-2 hover:bg-white/5 transition-all">
            Return Home Immediately
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // --- Task Handlers ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    addWorkspaceTask(slug, taskText.trim());
    setTaskText("");
  };

  // --- Note Handlers (with auto-save) ---
  const handleCreateNote = () => {
    const tempId = Math.random().toString();
    addWorkspaceNote(slug, "Untitled Note", "");
    setActiveNoteId(tempId); // This will sync in useEffect
  };

  const handleNoteChange = (title: string, content: string) => {
    setNoteTitle(title);
    setNoteContent(content);
    setSaveIndicator("Saving...");

    if (noteSaveTimeout.current) clearTimeout(noteSaveTimeout.current);

    noteSaveTimeout.current = setTimeout(() => {
      if (activeNoteId) {
        updateWorkspaceNote(slug, activeNoteId, { title, content });
        setSaveIndicator("Saved locally");
        setTimeout(() => setSaveIndicator(""), 2000);
      }
    }, 700);
  };

  const selectNote = (id: string) => {
    const selectedNote = workspace.notes.find((n) => n.id === id);
    if (selectedNote) {
      setActiveNoteId(id);
      setNoteTitle(selectedNote.title);
      setNoteContent(selectedNote.content);
      setSaveIndicator("");
    }
  };

  // --- Prompt Handlers ---
  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptTitle.trim() || !promptContent.trim()) return;
    addWorkspacePrompt(slug, promptTitle.trim(), promptContent.trim(), promptDesc.trim());
    setPromptTitle("");
    setPromptDesc("");
    setPromptContent("");
    setIsAddPromptOpen(false);
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Learning Handlers ---
  const handleAddLearning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningText.trim()) return;
    addWorkspaceLearning(slug, learningText.trim());
    setLearningText("");
  };

  // --- Resource Handlers ---
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;
    
    // Simple URL formatting
    let formattedUrl = resUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    addWorkspaceResource(slug, resTitle.trim(), formattedUrl, resDesc.trim());
    setResTitle("");
    setResUrl("");
    setResDesc("");
    setIsAddResOpen(false);
  };

  // --- Project Details Update Handlers ---
  const handleStatusChange = (statusValue: any) => {
    updateProject(slug, { status: statusValue });
  };

  const handleDeadlineChange = (deadlineValue: string) => {
    updateProject(slug, { deadline: deadlineValue || null });
  };

  return (
    <DashboardLayout>
      <div>
        {/* Back navigation and Pin toggle */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="
              flex items-center gap-2 text-xs font-light text-slate-500 hover:text-slate-300
              transition-colors duration-200 uppercase tracking-widest
            "
          >
            <ArrowLeft size={14} />
            Back to Workspace
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => togglePinProject(slug)}
              className={`
                rounded-xl border border-white/[0.04] p-2.5 transition-all duration-300
                hover:bg-white/5
                ${project.pinned ? "text-slate-200 bg-white/5" : "text-slate-500"}
              `}
              title={project.pinned ? "Pinned Project" : "Pin Project"}
            >
              <Pin size={15} className={project.pinned ? "fill-slate-300" : ""} />
            </button>
          </div>
        </div>

        {/* Project Header Info */}
        <div className="mt-10 pb-8 border-b border-white/[0.03]">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-light text-slate-100 tracking-tight sm:text-4xl">
                {project.title}
              </h1>
              <p className="mt-3 text-[15px] font-light leading-relaxed text-slate-400">
                {project.description}
              </p>
            </div>

            {/* Quick Metadata settings */}
            <div className="flex flex-wrap md:flex-col gap-4 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-light text-slate-600 uppercase tracking-wider min-w-[70px]">Status:</span>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-transparent border-0 py-0.5 pr-8 pl-1 text-slate-300 text-xs font-light focus:ring-0 focus:outline-none focus:border-slate-800"
                >
                  <option value="current" className="bg-[#0E121A]">Current</option>
                  <option value="hold" className="bg-[#0E121A]">On Hold</option>
                  <option value="completed" className="bg-[#0E121A]">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-light text-slate-600 uppercase tracking-wider min-w-[70px]">Deadline:</span>
                <input
                  type="date"
                  value={project.deadline || ""}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                  className="bg-transparent border-0 py-0.5 text-slate-300 text-xs font-light focus:ring-0 focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="mt-10">
          <div className="flex border-b border-white/[0.02] overflow-x-auto pb-px gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center gap-2 py-4 text-sm font-light tracking-wide transition-all focus:outline-none whitespace-nowrap
                    ${isActive ? "text-slate-100" : "text-slate-500 hover:text-slate-300"}
                  `}
                >
                  <Icon size={14} className={isActive ? "text-slate-300" : "text-slate-500"} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="workspaceTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-px bg-slate-300"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tab Body */}
        <div className="mt-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* --- TASKS TAB --- */}
              {activeTab === "tasks" && (
                <div className="max-w-xl">
                  <div className="space-y-1 mb-6">
                    {workspace.tasks.map((task) => (
                      <QuickTask
                        key={task.id}
                        text={task.text}
                        completed={task.completed}
                        onToggle={() => toggleWorkspaceTask(slug, task.id)}
                        onDelete={() => deleteWorkspaceTask(slug, task.id)}
                      />
                    ))}

                    {workspace.tasks.length === 0 && (
                      <p className="text-sm font-light text-slate-500 py-6 italic">
                        No project tasks found. Add a new milestone task below.
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleAddTask} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-transparent text-slate-500">
                      <Plus size={10} />
                    </div>
                    <input
                      type="text"
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      placeholder="Add a milestone task..."
                      className="
                        flex-1 bg-transparent border-0 border-b border-transparent py-1 text-sm font-light
                        text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-800
                        transition-all duration-300
                      "
                    />
                  </form>
                </div>
              )}

              {/* --- NOTES TAB (Multi-Note System with Auto Save) --- */}
              {activeTab === "notes" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Notes Sidebar */}
                  <div className="md:col-span-1 space-y-2 border-r border-white/[0.03] pr-4">
                    <button
                      onClick={handleCreateNote}
                      className="
                        w-full flex items-center gap-2 rounded-xl border border-white/[0.04]
                        bg-white/[0.01] px-4 py-2.5 text-xs font-light text-slate-300
                        hover:bg-white/[0.04] transition-all justify-center mb-4
                      "
                    >
                      <Plus size={12} />
                      Add Note
                    </button>

                    <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
                      {workspace.notes.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => selectNote(n.id)}
                          className={`
                            w-full text-left rounded-xl p-3 text-xs font-light transition-all flex flex-col gap-1
                            ${
                              activeNoteId === n.id
                                ? "bg-white/[0.03] text-slate-200 border border-white/[0.06]"
                                : "text-slate-500 hover:bg-white/[0.01] hover:text-slate-300 border border-transparent"
                            }
                          `}
                        >
                          <span className="font-normal truncate max-w-[130px]">{n.title || "Untitled"}</span>
                          <span className="text-[10px] text-slate-600 truncate max-w-[130px]">
                            {n.content ? n.content.substring(0, 40) : "Empty"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note Editing Area */}
                  <div className="md:col-span-3 flex flex-col gap-4">
                    {activeNoteId ? (
                      <div className="flex flex-col gap-4 h-full relative">
                        <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                          <input
                            type="text"
                            value={noteTitle}
                            onChange={(e) => handleNoteChange(e.target.value, noteContent)}
                            placeholder="Note title"
                            className="bg-transparent text-xl font-light text-slate-200 placeholder:text-slate-700 w-full focus:outline-none focus:ring-0 border-0 p-0"
                          />
                          
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-light text-slate-500 italic uppercase tracking-wider whitespace-nowrap">
                              {saveIndicator}
                            </span>
                            <button
                              onClick={() => {
                                if (activeNoteId) {
                                  deleteWorkspaceNote(slug, activeNoteId);
                                  setActiveNoteId(null);
                                }
                              }}
                              className="text-slate-600 hover:text-red-400 transition-colors p-1"
                              title="Delete note"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <textarea
                          value={noteContent}
                          onChange={(e) => handleNoteChange(noteTitle, e.target.value)}
                          placeholder="Start writing architecture ideas, notes, or prompts..."
                          rows={15}
                          className="
                            w-full bg-transparent text-sm font-light leading-relaxed text-slate-300
                            placeholder:text-slate-700 focus:outline-none focus:ring-0 border-0 p-0 resize-none
                          "
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-sm font-light text-slate-500">
                          Create or select a note to begin recording concepts.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- PROMPTS TAB --- */}
              {activeTab === "prompts" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-light text-slate-400 uppercase tracking-wider">Saved System Prompts</h3>
                    <button
                      onClick={() => setIsAddPromptOpen(!isAddPromptOpen)}
                      className="
                        flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.04]
                        px-3.5 py-1.5 text-xs font-light text-slate-300 hover:bg-white/[0.06] transition-all
                      "
                    >
                      <Plus size={12} />
                      {isAddPromptOpen ? "Cancel" : "Add Prompt"}
                    </button>
                  </div>

                  {/* Add Prompt Inline form */}
                  {isAddPromptOpen && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddPrompt}
                      className="border border-white/[0.04] bg-white/[0.01] rounded-2xl p-5 mb-8 max-w-xl space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-light text-slate-500 uppercase tracking-widest mb-1.5">Title</label>
                          <input
                            type="text"
                            required
                            value={promptTitle}
                            onChange={(e) => setPromptTitle(e.target.value)}
                            placeholder="e.g. Code Reviewer"
                            className="
                              w-full rounded-lg border border-white/[0.06] bg-white/[0.02]
                              px-3 py-2 text-xs font-light text-slate-200 focus:outline-none focus:border-slate-700
                            "
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-light text-slate-500 uppercase tracking-widest mb-1.5">Scope / Description</label>
                          <input
                            type="text"
                            value={promptDesc}
                            onChange={(e) => setPromptDesc(e.target.value)}
                            placeholder="Briefly define when to use this prompt..."
                            className="
                              w-full rounded-lg border border-white/[0.06] bg-white/[0.02]
                              px-3 py-2 text-xs font-light text-slate-200 focus:outline-none focus:border-slate-700
                            "
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-light text-slate-500 uppercase tracking-widest mb-1.5">Prompt Content</label>
                        <textarea
                          required
                          rows={4}
                          value={promptContent}
                          onChange={(e) => setPromptContent(e.target.value)}
                          placeholder="Paste the prompt system instruction..."
                          className="
                            w-full rounded-lg border border-white/[0.06] bg-white/[0.02]
                            px-3 py-2 text-xs font-light text-slate-200 focus:outline-none focus:border-slate-700 resize-none
                          "
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-white text-slate-900 px-4 py-1.5 text-xs font-medium hover:bg-slate-200 transition-all"
                        >
                          Save Prompt
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Prompt cards listing */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {workspace.prompts.map((p) => (
                      <div
                        key={p.id}
                        className="
                          group flex flex-col justify-between border border-white/[0.03]
                          bg-white/[0.01] rounded-2xl p-5 hover:border-white/[0.06] transition-all
                        "
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-slate-200">{p.title}</h4>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyPrompt(p.id, p.content)}
                                className="text-slate-500 hover:text-slate-300 transition-colors p-1 hover:bg-white/5 rounded-lg"
                                title="Copy prompt to clipboard"
                              >
                                {copiedId === p.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              </button>
                              
                              <button
                                onClick={() => deleteWorkspacePrompt(slug, p.id)}
                                className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-white/5 rounded-lg"
                                title="Delete prompt"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          
                          {p.description && (
                            <p className="text-[11px] font-light text-slate-500 italic mb-4">{p.description}</p>
                          )}
                          
                          <pre className="
                            text-[11px] font-mono leading-relaxed text-slate-400 bg-black/40
                            border border-white/[0.02] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-36
                          ">
                            {p.content}
                          </pre>
                        </div>
                      </div>
                    ))}

                    {workspace.prompts.length === 0 && !isAddPromptOpen && (
                      <p className="text-sm font-light text-slate-500 py-6 italic md:col-span-2">
                        No system prompts saved for this project. Save long templates, prompts, and directives above.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* --- LEARNING TAB --- */}
              {activeTab === "learning" && (
                <div className="max-w-xl">
                  <h3 className="text-sm font-light text-slate-400 uppercase tracking-wider mb-6">Knowledge Acquired</h3>
                  
                  <div className="space-y-4 mb-6">
                    {workspace.learning.map((log) => (
                      <div
                        key={log.id}
                        className="group flex items-center justify-between py-2.5 border-b border-white/[0.01]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-500 mt-2" />
                          <span className="text-sm font-light text-slate-300 tracking-wide leading-relaxed">
                            {log.text}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteWorkspaceLearning(slug, log.id)}
                          className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-white/5 rounded-lg"
                          title="Delete learning entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {workspace.learning.length === 0 && (
                      <p className="text-sm font-light text-slate-500 py-6 italic">
                        No learning notes listed. Document milestones, tech takeaways, and concepts below.
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleAddLearning} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-transparent text-slate-500">
                      <Plus size={10} />
                    </div>
                    <input
                      type="text"
                      value={learningText}
                      onChange={(e) => setLearningText(e.target.value)}
                      placeholder="Add something you learned..."
                      className="
                        flex-1 bg-transparent border-0 border-b border-transparent py-1 text-sm font-light
                        text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-800
                        transition-all duration-300
                      "
                    />
                  </form>
                </div>
              )}

              {/* --- RESOURCES TAB --- */}
              {activeTab === "resources" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-light text-slate-400 uppercase tracking-wider">Bookmarks & References</h3>
                    <button
                      onClick={() => setIsAddResOpen(!isAddResOpen)}
                      className="
                        flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.04]
                        px-3.5 py-1.5 text-xs font-light text-slate-300 hover:bg-white/[0.06] transition-all
                      "
                    >
                      <Plus size={12} />
                      {isAddResOpen ? "Cancel" : "Add Resource"}
                    </button>
                  </div>

                  {/* Add Resource Form */}
                  {isAddResOpen && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddResource}
                      className="border border-white/[0.04] bg-white/[0.01] rounded-2xl p-5 mb-8 max-w-md space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-light text-slate-500 uppercase tracking-widest mb-1.5">Title</label>
                          <input
                            type="text"
                            required
                            value={resTitle}
                            onChange={(e) => setResTitle(e.target.value)}
                            placeholder="e.g. pgvector Repo"
                            className="
                              w-full rounded-lg border border-white/[0.06] bg-white/[0.02]
                              px-3 py-2 text-xs font-light text-slate-200 focus:outline-none focus:border-slate-700
                            "
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-light text-slate-500 uppercase tracking-widest mb-1.5">Link / URL</label>
                          <input
                            type="text"
                            required
                            value={resUrl}
                            onChange={(e) => setResUrl(e.target.value)}
                            placeholder="github.com/pgvector/pgvector"
                            className="
                              w-full rounded-lg border border-white/[0.06] bg-white/[0.02]
                              px-3 py-2 text-xs font-light text-slate-200 focus:outline-none focus:border-slate-700
                            "
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-light text-slate-500 uppercase tracking-widest mb-1.5">Notes / Description</label>
                        <input
                          type="text"
                          value={resDesc}
                          onChange={(e) => setResDesc(e.target.value)}
                          placeholder="Brief description of why this resource is useful..."
                          className="
                            w-full rounded-lg border border-white/[0.06] bg-white/[0.02]
                            px-3 py-2 text-xs font-light text-slate-200 focus:outline-none focus:border-slate-700
                          "
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-white text-slate-900 px-4 py-1.5 text-xs font-medium hover:bg-slate-200 transition-all"
                        >
                          Save Resource
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Bookmark Grid listing */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {workspace.resources.map((r) => (
                      <div
                        key={r.id}
                        className="
                          group flex flex-col justify-between border border-white/[0.03]
                          bg-white/[0.01] rounded-2xl p-5 hover:border-white/[0.06] transition-all
                        "
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-medium text-slate-200">{r.title}</h4>
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors inline-flex"
                              >
                                <ExternalLink size={12} />
                              </a>
                            </div>
                            
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-light text-slate-500 hover:text-slate-400 transition-colors block mt-1 truncate max-w-[280px]"
                            >
                              {r.url}
                            </a>

                            {r.description && (
                              <p className="mt-3 text-xs font-light text-slate-400 leading-relaxed">{r.description}</p>
                            )}
                          </div>

                          <button
                            onClick={() => deleteWorkspaceResource(slug, r.id)}
                            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-white/5 rounded-lg ml-2"
                            title="Delete resource"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {workspace.resources.length === 0 && !isAddResOpen && (
                      <p className="text-sm font-light text-slate-500 py-6 italic md:col-span-2">
                        No external resources saved. Save libraries, documentation URLs, and bookmarks above.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}