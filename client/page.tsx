"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Pin, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useWorkspaceStore } from "@/lib/store";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import Link from "next/link";

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const hasHydrated = useHasHydrated();

  const {
    projects,
    workspaces,
    togglePinProject,
    addWorkspaceTask,
    toggleWorkspaceTask,
    deleteWorkspaceTask,
  } = useWorkspaceStore();

  const project = projects.find((p) => p.slug === slug);
  const workspace = workspaces[slug];
  const [newTaskText, setNewTaskText] = useState("");

  if (!hasHydrated) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-64 bg-white/5 rounded-2xl mb-6" />
          <div className="h-6 w-40 bg-white/5 rounded-lg mb-8" />
          <div className="h-96 bg-white/[0.02] border border-white/[0.04] rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-light text-gray-900 mb-4">Project not found</h1>
          <Link href="/" className="text-[#88BDF2] hover:text-[#6A89A7]">
            Back to workspace
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const tasks = workspace?.tasks || [];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addWorkspaceTask(slug, newTaskText.trim());
    setNewTaskText("");
  };

  const handleToggleTask = (taskId: string) => {
    toggleWorkspaceTask(slug, taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteWorkspaceTask(slug, taskId);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Soft background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] right-[10%] w-[40%] h-[50%] rounded-full bg-blue-100/30 blur-[140px]" />
      </div>

      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-[#BDDDFC]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-lg hover:bg-[#BDDDFC] text-[#6A89A7] hover:text-[#384959] transition-colors"
            title="Back to workspace"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-light text-gray-900 text-center">{project.title}</h1>
            <p className="text-sm font-light text-[#6A89A7] text-center mt-1">Tasks</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => togglePinProject(slug)}
              className={`p-2 rounded-lg transition-colors ${
                project.pinned
                  ? "bg-[#88BDF2] text-white"
                  : "hover:bg-[#BDDDFC] text-[#6A89A7]"
              }`}
              title={project.pinned ? "Unpin project" : "Pin project"}
            >
              <Pin size={18} />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-[#BDDDFC] text-[#6A89A7] hover:text-[#384959] transition-colors"
              title="More options"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Project Info */}
        <div className="mb-12">
          <p className="text-base font-light text-gray-700 leading-relaxed">
            {project.description}
          </p>
          {project.deadline && (
            <div className="flex items-center gap-2 mt-4 text-sm text-[#6A89A7]">
              <Calendar size={16} />
              <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-2xl border-2 border-[#BDDDFC] shadow-sm p-8">
          <h2 className="text-lg font-light text-[#6A89A7] uppercase tracking-wide mb-8">
            Tasks
          </h2>

          {/* Task List */}
          {tasks.length > 0 ? (
            <div className="mb-8 space-y-3">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between group p-4 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-[#BDDDFC]"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-5 h-5 rounded border-[#BDDDFC] text-[#88BDF2] cursor-pointer"
                    />
                    <span
                      className={`font-light transition-all ${
                        task.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                    title="Delete task"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-light text-[#6A89A7] italic py-8">
              No tasks yet. Add one below to get started.
            </p>
          )}

          {/* Add Task Form - Full Width */}
          <form onSubmit={handleAddTask} className="border-t border-[#BDDDFC] pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#88BDF2] bg-transparent text-[#88BDF2]">
                <span className="text-lg leading-none">+</span>
              </div>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a task..."
                className="
                  w-full bg-transparent border-0 text-base font-light
                  text-gray-900 placeholder:text-[#6A89A7] focus:outline-none
                  transition-all duration-300
                "
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
