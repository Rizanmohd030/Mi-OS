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
      {/* Fixed Calendar Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <CalendarButton onClick={() => setIsCalendarOpen(true)} />
      </div>

      <DashboardLayout>
        {/* Centered Title Header */}
        <div className="flex flex-col items-center justify-center mb-20">
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-gray-900 text-center">
            Resume Workspace
          </h1>
          <p className="mt-4 text-base font-light text-[#6A89A7] text-center">
            Personal operating system & project registry
          </p>
        </div>

        {/* Reset Button - Top Left Below Title */}
          <div className="flex justify-center mb-12">
            <button
              onClick={resetToDefault}
              className="
                rounded-xl border border-[#BDDDFC]
                bg-white p-3 text-[#6A89A7]
                transition-all duration-300 hover:bg-[#BDDDFC] hover:text-[#384959]
              "
              title="Reset to default demo data"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Project Section */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-lg font-light tracking-wide text-[#6A89A7] uppercase">
                Projects
              </h2>

              <button
                onClick={() => setIsAddProjectOpen(true)}
                className="
                  flex items-center gap-2 rounded-xl
                  bg-[#88BDF2] border border-[#88BDF2] px-4 py-2
                  text-xs font-light tracking-wider text-white uppercase
                  transition-all duration-300 hover:bg-[#6A89A7] hover:border-[#6A89A7]
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

          {/* Quick Tasks Section - Full Width */}
          <div className="mt-20">
          <h2 className="text-lg font-light tracking-wide text-[#6A89A7] uppercase mb-6">
            Quick Tasks
          </h2>

          <div className="max-w-2xl rounded-2xl bg-white border-2 border-[#BDDDFC] shadow-sm p-6">
            {/* Animated List with Tasks */}
            {quickTasks.length > 0 ? (
              <div className="mb-6">
                <AnimatedList
                  items={quickTasks.map(task => task.text)}
                  onItemSelect={(item, index) => {
                    const task = quickTasks[index];
                    if (task) {
                      toggleQuickTask(task.id);
                    }
                  }}
                  showGradients={false}
                  enableArrowNavigation={true}
                  displayScrollbar={true}
                  className="w-full"
                  itemClassName="bg-white hover:bg-blue-50"
                />
              </div>
            ) : (
              <p className="text-sm font-light text-[#6A89A7] py-4 italic mb-4">
                No tasks for today. Add one below to get started.
              </p>
            )}

            {/* Inline Task Add Form */}
            <form onSubmit={handleAddTask} className="flex items-center gap-3 border-t border-[#BDDDFC] pt-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#88BDF2] bg-transparent text-[#88BDF2]">
                <Plus size={10} />
              </div>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a task..."
                className="
                  flex-1 bg-transparent border-0 text-sm font-light
                  text-gray-900 placeholder:text-[#6A89A7] focus:outline-none
                  transition-all duration-300
                "
              />
            </form>

            {/* Delete task buttons */}
            {quickTasks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {quickTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => deleteQuickTask(task.id)}
                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Delete task"
                  >
                    ✕ {task.text}
                  </button>
                ))}
              </div>
            )}
          </div>
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