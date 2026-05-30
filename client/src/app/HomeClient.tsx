"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProjectCard from "@/components/dashboard/ProjectCard";
import QuickTask from "@/components/dashboard/QuickTask";
import CalendarButton from "@/components/dashboard/CalendarButton";
import CalendarModal from "@/components/dashboard/CalendarModal";
import { useHasHydrated } from "@/hooks/useHasHydrated";

import { createProject, getProjects, togglePinProject } from "@/lib/api/projects";

import {
  type FinanceLedgerResponse,
  getFinanceAccounts,
  getFinanceLedger,
} from "@/lib/api/finance";

import {
  createTask,
  deleteTask,
  getTasks,
  toggleTask,
  updateTask,
  type GlobalTask,
} from "@/lib/api/tasks";

const PROJECT_COLOR_KEY = "mi-os-project-colors";

const PROJECT_COLOR_OPTIONS = [
  { value: "white", swatch: "#E9E1D7" },
  { value: "black", swatch: "#111111" },
  { value: "purple", swatch: "#BF40BF" },
  { value: "orange", swatch: "#FFAA00" },
] as const;

type ProjectColorChoice = (typeof PROJECT_COLOR_OPTIONS)[number]["value"];

const readStoredProjectColors = (): Record<string, ProjectColorChoice> => {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem(PROJECT_COLOR_KEY) || "{}") as Record<string, ProjectColorChoice>;
  } catch {
    return {};
  }
};

const writeStoredProjectColors = (slug: string, color: ProjectColorChoice) => {
  if (typeof window === "undefined") return;

  const current = readStoredProjectColors();
  current[slug] = color;
  localStorage.setItem(PROJECT_COLOR_KEY, JSON.stringify(current));
};

type HomeClientProps = {
  initialProjects: any[];
  initialTasks: GlobalTask[];
  initialFinancePreview: FinanceLedgerResponse | null;
};

export default function HomeClient({
  initialProjects,
  initialTasks,
  initialFinancePreview,
}: HomeClientProps) {
  const hasHydrated = useHasHydrated();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [newTaskText, setNewTaskText] = useState("");
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjColor, setNewProjColor] = useState<ProjectColorChoice>("white");

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  const [backendProjects, setBackendProjects] = useState<any[]>(
    initialProjects || []
  );

  const [tasks, setTasks] = useState<GlobalTask[]>(initialTasks || []);

  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [financePreview, setFinancePreview] =
    useState<FinanceLedgerResponse | null>(initialFinancePreview || null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const storedColors = readStoredProjectColors();
        const projects = await getProjects();
        setBackendProjects(
          projects.map((project: any) => ({
            ...project,
            color: storedColors[project.slug] || project.color || undefined,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      setTasksLoading(true);
      setTasksError(null);

      try {
        setTasks(await getTasks());
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasksError("Unable to load quick tasks.");
      } finally {
        setTasksLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const accounts = await getFinanceAccounts();

        if (!accounts.length) return;

        setFinancePreview(await getFinanceLedger(accounts[0].id, 2));
      } catch (error) {
        console.error("Failed to fetch finance preview:", error);
      }
    })();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

  const formatTaskDate = (value: string) =>
    new Date(value).toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const groupedTasks = tasks.reduce<Record<string, GlobalTask[]>>(
    (groups, task) => {
      const dateKey = new Date(task.createdAt).toISOString().slice(0, 10);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(task);

      return groups;
    },
    {}
  );

  const taskDates = Object.keys(groupedTasks).sort((a, b) =>
    b.localeCompare(a)
  );

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskText.trim()) return;

    const text = newTaskText.trim();

    setNewTaskText("");

    const optimistic: GlobalTask = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [optimistic, ...prev]);

    try {
      const created = await createTask({
        text,
        completed: false,
      });

      setTasks((prev) => [
        created,
        ...prev.filter((t) => t.id !== optimistic.id),
      ]);
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));

      setNewTaskText(text);
    }
  };

  const handleToggleTask = async (id: number) => {
    let previous: GlobalTask[] = [];

    setTasks((prev) => {
      previous = prev;

      return prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
    });

    try {
      const updated = await toggleTask(id);

      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setTasks(previous);
    }
  };

  const handleDeleteTask = async (id: number) => {
    let previous: GlobalTask[] = [];

    setTasks((prev) => {
      previous = prev;

      return prev.filter((t) => t.id !== id);
    });

    try {
      await deleteTask(id);
    } catch {
      setTasks(previous);
    }
  };

  const handleEditTask = async (id: number, currentText: string) => {
    const nextText = window.prompt("Edit task", currentText);

    if (nextText === null) return;

    const text = nextText.trim();

    if (!text) return;

    let previous: GlobalTask[] = [];

    setTasks((prev) => {
      previous = prev;

      return prev.map((task) => (task.id === id ? { ...task, text } : task));
    });

    try {
      const updated = await updateTask(id, {
        text,
      });

      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    } catch {
      setTasks(previous);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjTitle.trim()) return;

    const slug = newProjTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (backendProjects.some((p) => p.slug === slug)) {
      return alert("A project with a similar title already exists.");
    }

    const created = await createProject({
      slug,
      title: newProjTitle.trim(),
      description: newProjDesc.trim() || "No description provided.",
      status: "current",
      pinned: false,
      color: newProjColor,
    });

    writeStoredProjectColors(created.slug, newProjColor);

    setBackendProjects((prev) => [
      {
        ...created,
        color: newProjColor,
      },
      ...prev,
    ]);

    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjColor("white");

    setIsAddProjectOpen(false);
  };

  const handlePinProject = async (project: any) => {
    const previousProjects = backendProjects;

    setBackendProjects((prev) =>
      prev.map((item) =>
        item.id === project.id ? { ...item, pinned: !item.pinned } : item
      )
    );

    try {
      const updated = await togglePinProject(project.id);

      setBackendProjects((prev) =>
        prev.map((item) => (item.id === project.id ? updated : item))
      );
    } catch (error) {
      console.error("Failed to toggle project pin:", error);
      setBackendProjects(previousProjects);
    }
  };

  const sortedProjects = [...backendProjects].sort((a, b) =>
    a.pinned === b.pinned
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : a.pinned
      ? -1
      : 1
  );

  const handleFinanceCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/finance");
  };

  if (!hasHydrated) {
    return (
      <DashboardLayout>
        <div className="h-40 animate-pulse bg-white/5" />
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        {/* HERO */}
        <section className="relative -mt-4 overflow-hidden bg-[#0f0f0f] px-8 pt-16 pb-14 sm:px-10 lg:px-16 xl:px-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(230,230,230,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(230,230,230,0.18) 1px, transparent 1px)",
              backgroundSize: "240px 240px",
            }}
          />

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-20 flex flex-col items-center justify-center">
              <h1 className="max-w-5xl py-14 text-center text-5xl font-black uppercase leading-[0.9] tracking-[-0.07em] text-[#F5F3EF] sm:text-6xl lg:text-[5.5rem]">
                Rizan's
                <br />
                Workspace
              </h1>
            </div>

            <div className="mb-6">
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.34em] text-white/75">
                Projects
              </h2>

              <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {sortedProjects.map((project, idx) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    colorIndex={idx}
                    onPin={handlePinProject}
                  />
                ))}

                <Link
                  href="/finance"
                  onClick={handleFinanceCardClick}
                  className="group flex min-h-[260px] flex-col justify-between border border-white/8 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-300/30 hover:bg-white/8"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.32em] text-white/55">
                      Finance
                    </p>

                    <Wallet size={18} className="text-white/55" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-2xl font-semibold text-[#F5F3EF]">
                      {financePreview
                        ? formatCurrency(financePreview.currentBalance)
                        : "Open Ledger"}
                    </p>

                    <p className="text-xs text-white/55">
                      {financePreview
                        ? "Current balance preview"
                        : "Track income and expenses"}
                    </p>
                  </div>
                </Link>

                <button
  onClick={() => setIsAddProjectOpen(true)}
  className="group relative flex min-h-[260px] items-center justify-center overflow-hidden border border-dashed border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-500 hover:border-cyan-300/25 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
>
  {/* glow */}
  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />

  {/* icon */}
  <div className="relative z-10 flex h-16 w-16 items-center justify-center border border-white/10 bg-black/20 transition-all duration-500 group-hover:scale-110 group-hover:border-cyan-200/30 group-hover:bg-black/40">
    <Plus
      size={28}
      className="text-white/70 transition-all duration-500 group-hover:rotate-90 group-hover:text-white"
    />
  </div>
</button>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK TASKS */}
        <section className="relative overflow-hidden bg-[#E9E1D7] px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="paper-surface absolute inset-0" />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.10),transparent_28%)]" />

          <div className="relative z-10 mx-auto max-w-6xl">
            <h2 className="mb-8 text-sm font-semibold uppercase tracking-[0.34em] text-[#373537]">
              Quick Tasks
            </h2>

            <div className="space-y-6">
              {taskDates.map((dateKey) => (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D6D3CE] pb-2 text-[11px] uppercase tracking-[0.25em] text-[#7b7771]">
                    <span>{formatTaskDate(`${dateKey}T00:00:00`)}</span>

                    <span>
                      {groupedTasks[dateKey].length} task
                      {groupedTasks[dateKey].length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {groupedTasks[dateKey].map((task) => (
                      <QuickTask
                        key={task.id}
                        text={task.text}
                        completed={task.completed}
                        onToggle={() => handleToggleTask(task.id)}
                        onEdit={() => handleEditTask(task.id, task.text)}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleAddTask}
              className="mt-8 flex items-center gap-4 border-t border-[#D6D3CE] pt-6"
            >
              <Plus size={18} className="text-[#373537]" />

              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a task..."
                className="flex-1 border-0 bg-transparent text-[15px] text-[#373537] placeholder:text-[#9a958f] focus:outline-none"
              />
            </form>
          </div>
        </section>
      </DashboardLayout>

      <CalendarModal
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
      <AnimatePresence>
        {isAddProjectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddProjectOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 18,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 18,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
              }}
              className="relative z-10 w-full max-w-md border border-[#D6D3CE] bg-[#F7F3EE] p-7 shadow-2xl"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <p className="pt-1 text-xs uppercase tracking-[0.32em] text-[#7b7771]">
                  Create Project
                </p>

                <div className="flex items-center gap-2">
                  {PROJECT_COLOR_OPTIONS.map((option) => {
                    const isSelected = newProjColor === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setNewProjColor(option.value)}
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? "border-[#373537] ring-2 ring-[#373537]/25"
                            : "border-[#D6D3CE]"
                        }`}
                        aria-label={option.value}
                        title={option.value}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full"
                          style={{ backgroundColor: option.swatch }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.25em] text-[#7b7771]">
                    Project Name
                  </label>

                  <input
                    type="text"
                    required
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    className="w-full border border-[#D6D3CE] bg-transparent px-4 py-3 text-sm text-[#373537] outline-none transition-colors focus:border-[#99938C]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.25em] text-[#7b7771]">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    className="w-full resize-none border border-[#D6D3CE] bg-transparent px-4 py-3 text-sm text-[#373537] outline-none transition-colors focus:border-[#99938C]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddProjectOpen(false)}
                    className="border border-[#D6D3CE] px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#55514C] transition-colors hover:bg-black hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-black px-5 py-2 text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
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
