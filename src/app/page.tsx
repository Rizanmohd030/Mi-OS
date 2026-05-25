"use client";

import { useState } from "react";
import { Plus, Settings, RotateCcw, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProjectCard from "@/components/dashboard/ProjectCard";
import CalendarButton from "@/components/dashboard/CalendarButton";
import CalendarModal from "@/components/dashboard/CalendarModal";
import QuickTask from "@/components/dashboard/QuickTask";
import { useWorkspaceStore } from "@/lib/store";
import { useHasHydrated } from "@/hooks/useHasHydrated";

export default function Home() {
  const hasHydrated = useHasHydrated();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  // Zustand Store
  const { 
    projects, 
    quickTasks, 
    addProject, 
    addQuickTask, 
    toggleQuickTask, 
    deleteQuickTask,
    resetToDefault
  } = useWorkspaceStore();

  // Inputs
  const [newTaskText, setNewTaskText] = useState("");
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjDeadline, setNewProjDeadline] = useState("");
  const [newProjStatus, setNewProjStatus] = useState<"current" | "hold" | "completed">("current");

  if (!hasHydrated) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div>
            <div className="h-12 w-64 bg-white/5 rounded-2xl mb-3" />
            <div className="h-5 w-80 bg-white/5 rounded-xl mb-16" />
          </div>
          <div className="h-6 w-20 bg-white/5 rounded-lg mb-8" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-40 bg-white/[0.02] border border-white/[0.04] rounded-2xl" />
            <div className="h-40 bg-white/[0.02] border border-white/[0.04] rounded-2xl" />
            <div className="h-40 bg-white/[0.02] border border-white/[0.04] rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }


  // Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addQuickTask(newTaskText.trim());
    setNewTaskText("");
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    
    const slug = newProjTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Avoid duplicate slugs
    if (projects.some((p) => p.slug === slug)) {
      alert("A project with a similar title already exists.");
      return;
    }

    addProject({
      slug,
      title: newProjTitle.trim(),
      description: newProjDesc.trim() || "No description provided.",
      status: newProjStatus,
      pinned: false,
      deadline: newProjDeadline || null,
    });

    // Reset fields
    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjDeadline("");
    setNewProjStatus("current");
    setIsAddProjectOpen(false);
  };

  // Sort projects: Pinned first, then by date created
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <DashboardLayout>
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-slate-100 sm:text-5xl">
              Rizan's Workspace
            </h1>
            <p className="mt-2.5 text-[15px] font-light text-slate-500">
              Personal operating system & project registry
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetToDefault}
              className="
                rounded-xl border border-white/[0.04]
                bg-white/[0.02] p-3 text-slate-400
                transition-all duration-300 hover:bg-white/[0.06] hover:text-slate-200
              "
              title="Reset to default demo data"
            >
              <RotateCcw size={18} />
            </button>
            
            <CalendarButton onClick={() => setIsCalendarOpen(true)} />
          </div>
        </div>

        {/* Project Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-light tracking-wide text-slate-400 uppercase">
              Projects
            </h2>

            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="
                flex items-center gap-2 rounded-xl
                bg-white/5 border border-white/[0.04] px-4 py-2
                text-xs font-light tracking-wider text-slate-300 uppercase
                transition-all duration-300 hover:bg-white/10 hover:text-white
              "
            >
              <Plus size={14} />
              New Project
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {sortedProjects.map((project) => (
                <motion.div
                  key={project.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Tasks Section */}
        <div className="mt-20">
          <h2 className="text-lg font-light tracking-wide text-slate-400 uppercase mb-6">
            Quick Tasks
          </h2>

          <div className="max-w-xl">
            {/* Inline Tasks List */}
            <div className="space-y-1 mb-4">
              <AnimatePresence mode="popLayout">
                {quickTasks.map((task) => (
                  <QuickTask
                    key={task.id}
                    text={task.text}
                    completed={task.completed}
                    onToggle={() => toggleQuickTask(task.id)}
                    onDelete={() => deleteQuickTask(task.id)}
                  />
                ))}
              </AnimatePresence>
              
              {quickTasks.length === 0 && (
                <p className="text-sm font-light text-slate-500 py-4 italic">
                  No tasks for today. Add one below to get started.
                </p>
              )}
            </div>

            {/* Inline Task Add Form */}
            <form onSubmit={handleAddTask} className="flex items-center gap-3 mt-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-transparent text-slate-500">
                <Plus size={10} />
              </div>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a task..."
                className="
                  flex-1 bg-transparent border-0 border-b border-transparent py-1 text-sm font-light
                  text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-800
                  transition-all duration-300
                "
              />
            </form>
          </div>
        </div>
      </div>

      {/* Calendar System Modal */}
      <CalendarModal
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* Create Project Modal */}
      <AnimatePresence>
        {isAddProjectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddProjectOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Form Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="
                relative z-10 w-full max-w-md rounded-2xl
                border border-white/[0.06] bg-[#0E121A] p-7 shadow-2xl
              "
            >
              <h3 className="text-xl font-light text-slate-200 mb-6">
                Create New Project
              </h3>

              <form onSubmit={handleCreateProject} className="space-y-5">
                <div>
                  <label className="block text-xs font-light text-slate-500 uppercase tracking-wider mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    placeholder="e.g. AI ERP"
                    className="
                      w-full rounded-lg border border-white/[0.06] bg-white/[0.02]
                      px-4 py-2.5 text-sm font-light text-slate-200 placeholder:text-slate-600
                      focus:outline-none focus:border-slate-700 focus:bg-white/[0.03] transition-all
                    "
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="Briefly describe the focus of this project..."
                    className="
                      w-full rounded-lg border border-white/[0.06] bg-white/[0.02]
                      px-4 py-2.5 text-sm font-light text-slate-200 placeholder:text-slate-600
                      focus:outline-none focus:border-slate-700 focus:bg-white/[0.03] transition-all resize-none
                    "
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-light text-slate-500 uppercase tracking-wider mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={newProjDeadline}
                      onChange={(e) => setNewProjDeadline(e.target.value)}
                      className="
                        w-full rounded-lg border border-white/[0.06] bg-white/[0.02]
                        px-3 py-2.5 text-sm font-light text-slate-300
                        focus:outline-none focus:border-slate-700 transition-all
                      "
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-light text-slate-500 uppercase tracking-wider mb-2">
                      Status
                    </label>
                    <select
                      value={newProjStatus}
                      onChange={(e) => setNewProjStatus(e.target.value as any)}
                      className="
                        w-full rounded-lg border border-white/[0.06] bg-[#0E121A]
                        px-3 py-2.5 text-sm font-light text-slate-300
                        focus:outline-none focus:border-slate-700 transition-all
                      "
                    >
                      <option value="current">Current</option>
                      <option value="hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddProjectOpen(false)}
                    className="
                      rounded-xl px-4 py-2.5 text-xs font-light tracking-wide text-slate-400
                      hover:text-slate-200 transition-all
                    "
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="
                      rounded-xl bg-white text-slate-900 px-5 py-2.5 text-xs font-medium tracking-wide
                      hover:bg-slate-200 transition-all
                    "
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}