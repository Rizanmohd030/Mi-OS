"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

import { createProjectTask, deleteProjectTask, toggleProjectTask, updateProjectTask, type ProjectTask } from "@/lib/api/projectTasks";
import { togglePinProject } from "@/lib/api/projects";
import QuickTask from "@/components/dashboard/QuickTask";

type WorkspaceProject = {
  id: number;
  slug: string;
  title: string;
  description: string;
  deadline?: string | null;
  pinned: boolean;
  createdAt?: string;
};

type WorkspaceClientProps = {
  slug: string;
  project: WorkspaceProject;
  projects: WorkspaceProject[];
  tasks: ProjectTask[];
};

type WorkspaceTheme = {
  base: string;
  surface: string;
  surfaceSoft: string;
  surfaceMuted: string;
  text: string;
  textSoft: string;
  textMuted: string;
  accent: string;
  line: string;
  lineSoft: string;
};

const createWorkspaceTheme = (key?: string): WorkspaceTheme => {
  switch (key) {
    case "purple":
      return {
        base: "#F7F4EE",
        surface: "#FFFFFF",
        surfaceSoft: "#FBF8F4",
        surfaceMuted: "#F7F4EE",
        text: "#111111",
        textSoft: "#111111",
        textMuted: "#111111",
        accent: "#BF40BF",
        line: "rgba(191, 64, 191, 0.28)",
        lineSoft: "rgba(191, 64, 191, 0.12)",
      };
    case "orange":
      return {
        base: "#F7F4EE",
        surface: "#FFFFFF",
        surfaceSoft: "#FBF8F4",
        surfaceMuted: "#F7F4EE",
        text: "#111111",
        textSoft: "#111111",
        textMuted: "#111111",
        accent: "#FFAA00",
        line: "rgba(255, 170, 0, 0.28)",
        lineSoft: "rgba(255, 170, 0, 0.12)",
      };
    case "black":
      return {
        base: "#F7F4EE",
        surface: "#FFFFFF",
        surfaceSoft: "#FBF8F4",
        surfaceMuted: "#F7F4EE",
        text: "#111111",
        textSoft: "#111111",
        textMuted: "#111111",
        accent: "#111111",
        line: "rgba(156, 156, 156, 0.30)",
        lineSoft: "rgba(156, 156, 156, 0.14)",
      };
    case "white":
    default:
      return {
        base: "#F7F4EE",
        surface: "#FFFFFF",
        surfaceSoft: "#FBF8F4",
        surfaceMuted: "#F7F4EE",
        text: "#111111",
        textSoft: "#111111",
        textMuted: "#111111",
        accent: "#E9E1D7",
        line: "rgba(214, 211, 206, 0.26)",
        lineSoft: "rgba(214, 211, 206, 0.12)",
      };
  }
};

export default function WorkspaceClient({
  slug,
  project,
  projects,
  tasks: initialTasks,
}: WorkspaceClientProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<{ bg?: string; text?: string }>({});
  const [colorKey, setColorKey] = useState<string | undefined>(undefined);
  const [newTaskText, setNewTaskText] = useState("");
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  const formatTaskDate = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(value));

  const groupedTasks = tasks.reduce<Record<string, ProjectTask[]>>((groups, task) => {
    const dateKey = new Date(task.createdAt).toISOString().slice(0, 10);

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(task);

    return groups;
  }, {});

  const taskDates = Object.keys(groupedTasks).sort((a, b) => b.localeCompare(a));

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const text = newTaskText.trim();
    const optimisticId = Date.now();
    setIsCreatingTask(true);
    setTasks((prev) => [
      {
        id: optimisticId,
        projectId: project.id,
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewTaskText("");

    try {
      const createdTask = await createProjectTask(project.id, { text, completed: false });
      setTasks((prev) => [createdTask, ...prev.filter((task) => task.id !== optimisticId)]);
    } catch (error) {
      console.error(error);
      setTasks((prev) => prev.filter((task) => task.id !== optimisticId));
      setNewTaskText(text);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTask = async (id: number) => {
    setActiveTaskId(id);
    let previousTasks: ProjectTask[] = [];

    setTasks((prev) => {
      previousTasks = prev;
      return prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
    });

    try {
      const updatedTask = await toggleProjectTask(id);
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
    } finally {
      setActiveTaskId(null);
    }
  };

  const handleDeleteTask = async (id: number) => {
    setActiveTaskId(id);
    let previousTasks: ProjectTask[] = [];

    setTasks((prev) => {
      previousTasks = prev;
      return prev.filter((task) => task.id !== id);
    });

    try {
      await deleteProjectTask(id);
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
    } finally {
      setActiveTaskId(null);
    }
  };

  const handleEditTask = async (task: ProjectTask) => {
    const nextText = window.prompt("Edit task", task.text);
    if (nextText === null) return;

    const text = nextText.trim();
    if (!text) return;

    setActiveTaskId(task.id);
    let previousTasks: ProjectTask[] = [];

    setTasks((prev) => {
      previousTasks = prev;
      return prev.map((item) => (item.id === task.id ? { ...item, text } : item));
    });

    try {
      const updatedTask = await updateProjectTask(task.id, { text });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updatedTask : item)));
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
    } finally {
      setActiveTaskId(null);
    }
  };

  const handleTogglePin = async () => {
    await togglePinProject(project.id);
    router.refresh();
  };

  // Apply project theme: check active project key first, then stored project colors mapping
  useEffect(() => {
    try {
      const rawActive = localStorage.getItem("mi-os-active-project");
      if (rawActive) {
        const parsed = JSON.parse(rawActive) as { slug?: string; color?: string } | null;
        if (parsed && parsed.slug === slug && parsed.color) {
          const color = parsed.color;
          setColorKey(color);
          if (color === "black") setTheme({ bg: "#111111", text: "#FFFFFF" });
          else if (color === "white") setTheme({ bg: "#E9E1D7", text: "#111111" });
          else if (color === "purple") setTheme({ bg: "#BF40BF", text: "#111111" });
          else if (color === "orange") setTheme({ bg: "#FFAA00", text: "#111111" });
          return;
        }
      }

      const stored = localStorage.getItem("mi-os-project-colors");
      if (stored) {
        const map = JSON.parse(stored || "{}") as Record<string, string>;
        const key = map[slug];
        if (key) {
          setColorKey(key);
          if (key === "black") setTheme({ bg: "#111111", text: "#FFFFFF" });
          else if (key === "white") setTheme({ bg: "#E9E1D7", text: "#111111" });
          else if (key === "purple") setTheme({ bg: "#BF40BF", text: "#111111" });
          else if (key === "orange") setTheme({ bg: "#FFAA00", text: "#111111" });
        }
      }
    } catch {
      // ignore
    }
  }, [slug]);

  const workspaceTheme = createWorkspaceTheme(colorKey);

  const topStyle: React.CSSProperties = {};
  if (workspaceTheme.base) topStyle.backgroundColor = workspaceTheme.base;
  topStyle.backgroundRepeat = "no-repeat";
  topStyle.backgroundSize = "cover";
  topStyle.backgroundAttachment = "fixed";
  topStyle.color = "#111111";

  return (
    <div className="relative h-screen overflow-hidden" style={topStyle}>
      <motion.aside className="fixed left-0 top-0 h-screen w-56 flex flex-col overflow-hidden z-50 shadow-lg" style={{
        backgroundColor: "#111111",
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 34px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 34px)",
      }}>
        <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
          <Link href="/" className="flex items-center gap-2 text-base font-semibold text-white transition-colors tracking-tight">
            Mi-OS
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {projects.map((item) => {
              const active = item.slug === slug;
              return (
                <Link
                  key={item.slug}
                  href={`/Workspace/${item.slug}`}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${active ? "bg-white/10 text-white font-medium" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                >
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.aside>

      <main className="h-screen w-full flex flex-col overflow-hidden ml-56">
        <div className="flex-1 overflow-y-auto">
         <div className="min-h-full">
  {/* Hero Section */}
  <div className="px-8 pt-12 pb-10">
    <div className="flex w-full items-start gap-12">
      
      {/* Title Area */}
      <div className="min-w-0 flex-1">
        <h1 className="text-5xl font-black tracking-[-0.04em] text-black sm:text-6xl">
          {project.title}
        </h1>

        {project.deadline && (
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-black/50">
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(project.deadline))}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="w-full max-w-sm pt-3">
        <p className="text-sm font-light leading-relaxed text-black/70">
          {project.description || "No description provided."}
        </p>
      </div>
    </div>
  </div>

  {/* Tasks Section */}
  <div className="w-full max-w-5xl px-8 pb-10">
    <div className="space-y-8">
      {taskDates.length > 0 ? (
        taskDates.map((dateKey) => (
          <div key={dateKey} className="space-y-4">

            {/* Date Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-3 text-[11px] uppercase tracking-[0.25em] text-black/40">
              <span>
                {formatTaskDate(`${dateKey}T00:00:00`)}
              </span>

              <span>
                {groupedTasks[dateKey].length} task
                {groupedTasks[dateKey].length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {groupedTasks[dateKey].map((task) => (
                <QuickTask
                  key={task.id}
                  text={task.text}
                  completed={task.completed}
                  onToggle={
                    activeTaskId === task.id
                      ? undefined
                      : () => handleToggleTask(task.id)
                  }
                  onEdit={
                    activeTaskId === task.id
                      ? undefined
                      : () => handleEditTask(task)
                  }
                  onDelete={
                    activeTaskId === task.id
                      ? undefined
                      : () => handleDeleteTask(task.id)
                  }
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="py-12 text-sm text-black/50">
          No tasks yet
        </div>
      )}
    </div>

    {/* Add Task */}
    <form
      onSubmit={handleAddTask}
      className="mt-10 flex items-center gap-4 border-t border-black/10 pt-6"
    >
      <Plus size={18} className="text-black/70" />

      <input
        type="text"
        value={newTaskText}
        onChange={(e) => setNewTaskText(e.target.value)}
        placeholder="Add a task..."
        disabled={isCreatingTask}
        className="flex-1 border-0 bg-transparent text-[15px] text-black/80 placeholder:text-black/35 focus:outline-none disabled:opacity-60"
      />
    </form>
  </div>
</div>
        </div>
      </main>
    </div>
  );
}
