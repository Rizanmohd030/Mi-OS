"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import {
  Menu,
  ChevronLeft,
  Plus,
} from "lucide-react";

import { useWorkspaceStore } from "@/lib/store";
import { useHasHydrated } from "@/hooks/useHasHydrated";

type WorkspaceTaskItemProps = {
  task: {
    id: string;
    text: string;
    completed: boolean;
  };
  onToggle: () => void;
};

function WorkspaceTaskItem({
  task,
  onToggle,
}: WorkspaceTaskItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        flex items-center justify-between
        border-b border-[#E5E4E2]
        bg-[#faf9f9]
        px-6 py-4
        transition-all duration-200
        hover:bg-[#f1f0ed]
      "
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="
            transition-all duration-200
            rounded-sm
            flex items-center justify-center
            w-5 h-5
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

        <p
          className={`
            text-[15px] transition-all duration-200
            ${
              task.completed
                ? "text-[#888888] line-through opacity-50"
                : "text-[#333333]"
            }
          `}
        >
          {task.text}
        </p>
      </div>
    </motion.div>
  );
}

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const hasHydrated = useHasHydrated();

  const {
    projects,
    workspaces,
    addWorkspaceTask,
    toggleWorkspaceTask,
  } = useWorkspaceStore();

  const [newTaskText, setNewTaskText] =
    useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!hasHydrated) return null;

  const project = projects.find(
    (p) => p.slug === slug
  );

  if (!project) {
    return (
      <div className="p-10">
        Project not found
      </div>
    );
  }

  const workspace = workspaces[slug];

  const tasks = workspace?.tasks || [];

  const today = new Date();

  const formattedDate =
    today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const handleAddTask = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newTaskText.trim()) return;

    addWorkspaceTask(
      slug,
      newTaskText.trim()
    );

    setNewTaskText("");
  };

  return (
    <div className="relative h-screen bg-[#faf9f9] text-[#333333] overflow-hidden">
      {/* SIDEBAR OVERLAY */}
      <motion.aside
        animate={{
          x: sidebarOpen ? 0 : -240,
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut"
        }}
        className="
          fixed left-0 top-0 h-screen w-60
          flex flex-col
          border-r border-[#E5E4E2]
          bg-[#f1f0ed]
          overflow-hidden
          z-50
          shadow-lg
        "
      >
        {/* SIDEBAR HEADER - Mi-OS + Hamburger */}
        <div className="px-4 py-5 border-b border-[#E5E4E2] flex items-center justify-between">
          <Link
            href="/"
            className="
              flex items-center gap-2
              text-base font-semibold
              text-[#333333]
              hover:text-[#88BDF2]
              transition-colors tracking-tight
            "
          >
            Mi-OS
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="
              rounded-md p-2
              transition-all duration-200
              hover:bg-[#E5E4E2]/50
            "
            aria-label="Close sidebar"
          >
            <Menu
              size={20}
              className="text-[#333333]"
            />
          </button>
        </div>

        {/* PROJECTS LIST */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {projects.map((item) => {
              const active = item.slug === slug;

              return (
                <Link
                  key={item.slug}
                  href={`/Workspace/${item.slug}`}
                  className={`
                    flex items-center gap-3
                    rounded-md px-3 py-2
                    text-sm
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[#d8e2ff]/40 text-[#88BDF2] font-medium"
                        : "text-[#444748] hover:bg-[#E5E4E2]/50"
                    }
                  `}
                >
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.aside>

      {/* BACKDROP OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 z-40"
          />
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main className="h-screen w-full flex flex-col overflow-hidden">
        {/* HEADER - Simple with Mi-OS centered */}
        <div
          className="
            border-b border-[#E5E4E2]
            px-10 py-4
            flex items-center justify-between
          "
        >
          {/* Hamburger Button */}
          <button
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            className="
              rounded-md p-2
              transition-all duration-200
              hover:bg-[#E5E4E2]/50
              -ml-2
            "
            aria-label="Toggle sidebar"
          >
            <Menu
              size={24}
              className="text-[#333333]"
            />
          </button>

          {/* Centered Mi-OS */}
          <div className="flex-1 flex justify-center">
            <span className="text-base font-medium text-[#333333] uppercase tracking-wide">
              Mi-OS
            </span>
          </div>

          {/* Spacer to balance layout */}
          <div className="w-10" />
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {/* PROJECT TITLE */}
            <div className="px-10 pt-12 pb-8">
              <h1
                className="
                  text-4xl font-semibold
                  tracking-tight
                  text-[#333333]
                "
                style={{letterSpacing: '-0.01em'}}
              >
                {project.title}
              </h1>

              <p
                className="
                  mt-3 text-sm
                  text-[#888888]
                "
              >
                {formattedDate}
              </p>
            </div>

            {/* TASKS */}
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <WorkspaceTaskItem
                  key={task.id}
                  task={task}
                  onToggle={() =>
                    toggleWorkspaceTask(
                      slug,
                      task.id
                    )
                  }
                />
              ))
            ) : (
              <div className="px-10 py-10 text-[#888888]">
                No tasks yet
              </div>
            )}

            {/* EMPTY LINES */}
            <div className="px-6">
              {Array.from({ length: 12 }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="
                      h-[58px]
                      border-b border-[#E5E4E2]
                    "
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* ADD TASK */}
        <div
          className="
            border-t border-[#E5E4E2]
            bg-[#faf9f9]
            px-6 py-5
          "
        >
          <form
            onSubmit={handleAddTask}
            className="
              flex items-center gap-4
            "
          >
            <Plus
              size={20}
              className="text-[#888888]"
            />

            <input
              type="text"
              value={newTaskText}
              onChange={(e) =>
                setNewTaskText(
                  e.target.value
                )
              }
              placeholder="Add a task"
              className="
                w-full bg-transparent
                text-[15px] text-[#333333]
                placeholder:text-[#c4c7c7]
                focus:outline-none
              "
            />
          </form>
        </div>
      </main>
    </div>
  );
}