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
import { createProject, getProjects } from "@/lib/api/projects";
import { type FinanceLedgerResponse, getFinanceAccounts, getFinanceLedger } from "@/lib/api/finance";
import { createTask, deleteTask, getTasks, toggleTask, updateTask, type GlobalTask } from "@/lib/api/tasks";

export default function Home() {
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [newTaskText, setNewTaskText] = useState("");
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [backendProjects, setBackendProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<GlobalTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [financePreview, setFinancePreview] = useState<FinanceLedgerResponse | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        setBackendProjects(await getProjects());
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
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const text = newTaskText.trim();
    setNewTaskText("");
    const optimistic: GlobalTask = { id: Date.now(), text, completed: false, createdAt: new Date().toISOString() };
    setTasks((prev) => [optimistic, ...prev]);
    try {
      const created = await createTask({ text, completed: false });
      setTasks((prev) => [created, ...prev.filter((t) => t.id !== optimistic.id)]);
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
      setNewTaskText(text);
    }
  };

  const handleToggleTask = async (id: number) => {
    let previous: GlobalTask[] = [];
    setTasks((prev) => {
      previous = prev;
      return prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
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
      const updated = await updateTask(id, { text });
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    } catch {
      setTasks(previous);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    const slug = newProjTitle.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
    if (backendProjects.some((p) => p.slug === slug)) return alert("A project with a similar title already exists.");
    const created = await createProject({ slug, title: newProjTitle.trim(), description: newProjDesc.trim() || "No description provided.", status: "current", pinned: false });
    setBackendProjects((prev) => [created, ...prev]);
    setNewProjTitle("");
    setNewProjDesc("");
    setIsAddProjectOpen(false);
  };

  const sortedProjects = [...backendProjects].sort((a, b) => (a.pinned === b.pinned ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : a.pinned ? -1 : 1));
  const handleFinanceCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/finance");
  };

  if (!hasHydrated) return <DashboardLayout><div className="h-40 animate-pulse rounded-2xl bg-white/5" /></DashboardLayout>;

  return (
    <>
      <div className="border-b border-[#E5E4E2] bg-[#faf9f9] shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 sm:px-10">
          <div className="relative" ref={profileRef}>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="text-base font-medium uppercase tracking-wide text-[#333333] transition-colors hover:text-[#88BDF2]">Mi-OS</button>
            <AnimatePresence>{isProfileOpen && <motion.div initial={{ opacity: 0, y: -10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.96 }} transition={{ duration: 0.2 }} className="absolute left-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-[#E5E4E2] bg-white shadow-xl"><div className="p-4"><p className="text-sm font-semibold text-[#333333]">Rizan</p></div></motion.div>}</AnimatePresence>
          </div>
          <CalendarButton onClick={() => setIsCalendarOpen(true)} />
        </div>
      </div>

      <DashboardLayout>
        <div className="mb-20 flex flex-col items-center justify-center">
          <h1 className="text-center text-5xl font-semibold tracking-tight text-[#333333] sm:text-6xl">Rizan's Workspace</h1>
          <p className="mt-4 text-center text-base text-[#888888]">Digital sanctuary for organized minds</p>
        </div>

        <div className="mb-20">
          <h2 className="mb-10 text-sm font-semibold uppercase tracking-widest text-[#333333]">Projects</h2>
          <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sortedProjects.map((project, idx) => <ProjectCard key={project.id} project={project} colorIndex={idx} />)}
            <Link href="/finance" onClick={handleFinanceCardClick} className="group flex min-h-[260px] flex-col justify-between rounded-2xl border border-[#E5E4E2] bg-white/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#c4c7c7]">
              <div className="flex items-center justify-between"><p className="text-xs uppercase tracking-widest text-[#888888]">Finance</p><Wallet size={18} className="text-[#888888]" /></div>
              <div className="space-y-2"><p className="text-2xl font-semibold text-[#333333]">{financePreview ? formatCurrency(financePreview.currentBalance) : "Open Ledger"}</p><p className="text-xs text-[#888888]">{financePreview ? "Current balance preview" : "Track income and expenses"}</p></div>
            </Link>
            <button onClick={() => setIsAddProjectOpen(true)} className="group flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-[#E5E4E2] bg-transparent transition-all duration-300 hover:border-[#c4c7c7] hover:bg-white/40"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E5E4E2] bg-white/30"><Plus size={26} className="text-[#888888] transition-colors duration-300 group-hover:text-[#333333]" /></div></button>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-[#333333]">Quick Tasks</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <QuickTask
                key={task.id}
                text={task.text}
                completed={task.completed}
                onToggle={() => handleToggleTask(task.id)}
                onEdit={() => handleEditTask(task.id, task.text)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
            {!tasks.length && tasksLoading && <p className="py-4 text-sm text-[#888888]">Loading tasks...</p>}
            {!tasks.length && !tasksLoading && tasksError && <p className="py-4 text-sm text-[#888888]">{tasksError}</p>}
            {!tasks.length && !tasksLoading && !tasksError && <p className="py-4 text-sm text-[#888888]">No quick tasks yet. Add one below to get started.</p>}
          </div>
          <form onSubmit={handleAddTask} className="mt-8 flex items-center gap-4 border-t border-[#E5E4E2] pt-6">
            <Plus size={18} className="text-[#0058be]" />
            <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Add a task..." className="flex-1 border-0 bg-transparent text-[15px] text-[#333333] placeholder:text-[#c4c7c7] focus:outline-none" />
          </form>
        </div>
      </DashboardLayout>

      <CalendarModal open={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />

      <AnimatePresence>
        {isAddProjectOpen && <div className="fixed inset-0 z-50 flex items-center justify-center"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddProjectOpen(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" /><motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ type: "spring", duration: 0.4 }} className="relative z-10 w-full max-w-md rounded-2xl border-2 border-[#BDDDFC] bg-white p-7 shadow-lg"><h3 className="mb-6 text-xl font-light text-gray-900">Create New Project</h3><form onSubmit={handleCreateProject} className="space-y-5"><input type="text" required value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} placeholder="Project Name" className="w-full rounded-lg border border-[#BDDDFC] bg-blue-50 px-4 py-2.5 text-sm" /><textarea rows={3} value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} placeholder="Description (Optional)" className="w-full rounded-lg border border-[#BDDDFC] bg-blue-50 px-4 py-2.5 text-sm" /><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setIsAddProjectOpen(false)} className="rounded-xl px-4 py-2.5 text-xs">Cancel</button><button type="submit" className="rounded-xl bg-[#88BDF2] px-5 py-2.5 text-xs text-white">Create</button></div></form></motion.div></div>}
      </AnimatePresence>
    </>
  );
}
