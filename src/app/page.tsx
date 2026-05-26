"use client";

import { useState } from "react";
import { Plus, Settings, RotateCcw, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProjectCard from "@/components/dashboard/ProjectCard";
import CalendarButton from "@/components/dashboard/CalendarButton";
import CalendarModal from "@/components/dashboard/CalendarModal";
import QuickTask from "@/components/dashboard/QuickTask";
import AnimatedList from "@/components/ui/AnimatedList";
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
      status: "current",
      pinned: false,
      deadline: null,
    });

    // Reset fields
    setNewProjTitle("");
    setNewProjDesc("");
    setIsAddProjectOpen(false);
  };

  // Sort projects: Pinned first, then by date created
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      {/* Navbar - Static (scrolls with content) */}
      <div className="bg-[#faf9f9] border-b border-[#E5E4E2] shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 sm:px-10">
          <div className="text-base font-medium text-[#333333] uppercase tracking-wide">
            Mi-OS
          </div>
           <CalendarButton onClick={() => setIsCalendarOpen(true)} />
        </div>
      </div>

      <DashboardLayout>
        {/* Centered Title Header */}
        <div className="flex flex-col items-center justify-center mb-20">
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-[#333333] text-center" style={{letterSpacing: '-0.02em'}}>
            Productivity Workspace
          </h1>
          <p className="mt-4 text-base font-normal text-[#888888] text-center">
            Digital sanctuary for organized minds
          </p>
        </div>

        {/* Project Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-sm font-semibold tracking-widest text-[#333333] uppercase" style={{letterSpacing: '0.05em'}}>
              Projects
            </h2>

              <button
                onClick={() => setIsAddProjectOpen(true)}
                className="
                  flex items-center gap-2 rounded-lg
                  bg-[#0058be] border border-[#0058be] px-4 py-2
                  text-xs font-medium tracking-wider text-white uppercase
                  transition-all duration-200 hover:bg-[#003d8a]
                "
              >
                <Plus size={14} />
                New Project
              </button>
            </div>

            {/* Cards Grid - Full Width Spread */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
              <AnimatePresence mode="popLayout">
                {sortedProjects.map((project, idx) => (
                  <motion.div
                    key={project.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProjectCard project={project} colorIndex={idx} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Tasks Section */}
          <div className="mt-20">
            <h2 className="text-sm font-semibold tracking-widest text-[#333333] uppercase mb-8">
              Quick Tasks
            </h2>

            <div className="space-y-8">
              {quickTasks.length > 0 ? (
                (() => {
                  // Group tasks by date
                  const groupedByDate = quickTasks.reduce((acc, task) => {
                    const date = new Date(task.createdAt);
                    const dateKey = date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).toUpperCase();
                    
                    if (!acc[dateKey]) {
                      acc[dateKey] = [];
                    }
                    acc[dateKey].push(task);
                    return acc;
                  }, {} as Record<string, typeof quickTasks>);

                  return Object.entries(groupedByDate).map(([dateKey, tasksForDate]) => (
                    <div key={dateKey} className="mb-8">
                      <h3 className="text-xs font-normal text-[#888888] uppercase tracking-wider mb-4">
                        {dateKey}
                      </h3>
                      <div className="space-y-3">
                        {tasksForDate.map((task) => (
                          <div
                            key={task.id}
                            className="
                              bg-white rounded-md px-4 py-3
                              flex items-center gap-4 group
                              border border-[#E5E4E2]
                              hover:border-[#c4c7c7]
                              transition-all duration-200
                            "
                          >
                            <button
                              onClick={() => toggleQuickTask(task.id)}
                              className="
                                flex-shrink-0 rounded-sm
                                flex items-center justify-center
                                w-5 h-5
                                transition-all duration-200
                              "
                            >
                              {task.completed ? (
                                <div className="w-5 h-5 bg-[#333333] rounded-sm flex items-center justify-center border border-[#333333]">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-sm border-1.5 border-[#E5E4E2] hover:border-[#c4c7c7]" />
                              )}
                            </button>
                            
                            <span
                              className={`
                                text-[15px] transition-all duration-200 flex-1
                                ${
                                  task.completed
                                    ? "text-[#888888] line-through opacity-50"
                                    : "text-[#333333]"
                                }
                              `}
                            >
                              {task.text}
                            </span>

                            <button
                              onClick={() => deleteQuickTask(task.id)}
                              className="
                                flex-shrink-0 opacity-0 group-hover:opacity-100
                                transition-opacity duration-200
                                text-[#888888] hover:text-red-500
                                text-xs
                              "
                              title="Delete task"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()
              ) : (
                <p className="text-sm text-[#888888] py-4">
                  No tasks yet. Add one below to get started.
                </p>
              )}
            </div>

            {/* Add Task Form */}
            <form
              onSubmit={handleAddTask}
              className="mt-8 flex items-center gap-4 pt-6 border-t border-[#E5E4E2]"
            >
              <Plus size={18} className="text-[#0058be]" />
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a task..."
                className="
                  flex-1 bg-transparent border-0 text-[15px]
                  text-[#333333] placeholder:text-[#c4c7c7]
                  focus:outline-none transition-all duration-200
                "
              />
            </form>
          </div>
        </DashboardLayout>

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
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />

            {/* Form Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="
                relative z-10 w-full max-w-md rounded-2xl
                border-2 border-[#BDDDFC] bg-white p-7 shadow-lg
              "
            >
              <h3 className="text-xl font-light text-gray-900 mb-6">
                Create New Project
              </h3>

              <form onSubmit={handleCreateProject} className="space-y-5">
                <div>
                  <label className="block text-xs font-light text-[#6A89A7] uppercase tracking-wider mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    placeholder="e.g. AI ERP"
                    className="
                      w-full rounded-lg border border-[#BDDDFC] bg-blue-50
                      px-4 py-2.5 text-sm font-light text-gray-900 placeholder:text-[#6A89A7]
                      focus:outline-none focus:border-[#88BDF2] focus:bg-white transition-all
                    "
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-[#6A89A7] uppercase tracking-wider mb-2">
                    Description <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="Briefly describe the focus of this project..."
                    className="
                      w-full rounded-lg border border-[#BDDDFC] bg-blue-50
                      px-4 py-2.5 text-sm font-light text-gray-900 placeholder:text-[#6A89A7]
                      focus:outline-none focus:border-[#88BDF2] focus:bg-white transition-all resize-none
                    "
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddProjectOpen(false)}
                    className="
                      rounded-xl px-4 py-2.5 text-xs font-light tracking-wide text-[#6A89A7]
                      hover:text-[#384959] hover:bg-[#BDDDFC] transition-all
                    "
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="
                      rounded-xl bg-[#88BDF2] text-white px-5 py-2.5 text-xs font-medium tracking-wide
                      hover:bg-[#6A89A7] transition-all
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
    </>
  );
}