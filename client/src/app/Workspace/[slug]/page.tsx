"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getProjectTasks,
  createProjectTask,
  toggleProjectTask,
  updateProjectTask,
  deleteProjectTask,
} from "@/lib/api/projectTasks";

import {
  getProjectBySlug,
  getProjects,
} from "@/lib/api/projects";

import Link from "next/link";

import {
  motion,
  AnimatePresence,
} from "framer-motion";
import CreateProjectModal from "@/components/dashboard/CreateProjectModal";

import {
  Menu,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

type WorkspaceTaskItemProps = {
  task: {
    id: number;
    text: string;
    completed: boolean;
  };

  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isBusy: boolean;
};

function WorkspaceTaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  isBusy,
}: WorkspaceTaskItemProps) {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        group flex items-start justify-between gap-4
        border-b border-[#E5E4E2]
        bg-[#faf9f9]
        px-6 py-4
        transition-all duration-200
        hover:bg-[#f1f0ed]
      "
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <button
          onClick={onToggle}
          disabled={isBusy}
          className="
            transition-all duration-200
            rounded-sm
            flex items-center justify-center
            w-5 h-5
            disabled:opacity-60
          "
        >
          {task.completed ? (
            <div className="w-5 h-5 bg-[#333333] rounded-sm flex items-center justify-center border border-[#333333]">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-sm border border-[#E5E4E2] hover:border-[#c4c7c7]" />
          )}
        </button>

        <p
          className={`
            flex-1 min-w-0 cursor-text whitespace-normal break-words text-[15px] leading-relaxed select-text transition-all duration-200
            ${
              task.completed
                ? "text-[#333333] line-through opacity-75"
                : "text-[#333333]"
            }
          `}
        >
          {task.text}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={onEdit}
          disabled={isBusy}
          className="rounded-md p-1.5 text-[#888888] transition-colors hover:bg-white/70 hover:text-[#333333] disabled:opacity-60"
          title="Edit task"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          disabled={isBusy}
          className="rounded-md p-1.5 text-[#888888] transition-colors hover:bg-white/70 hover:text-red-500 disabled:opacity-60"
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

type TaskItem = {
  id: number;
  projectId: number;
  text: string;
  completed: boolean;
  createdAt: string;
};

export default function WorkspacePage({
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = useParams<{ slug: string }>();

  const hasHydrated =
    useHasHydrated();

  const [newTaskText, setNewTaskText] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [project, setProject] =
    useState<any>(null);

  const [projects, setProjects] =
    useState<any[]>([]);

  const [tasks, setTasks] =
    useState<TaskItem[]>([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          projectData,
          projectsData,
        ] = await Promise.all([
          getProjectBySlug(slug),
          getProjects(),
        ]);

        const tasksData =
          await getProjectTasks(projectData.id);

        setProject(projectData);

        setProjects(projectsData);

        setTasks(tasksData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [slug]);

  if (!hasHydrated) return null;

  if (!project) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  const today = new Date();

  const formattedDate =
    today.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
      }
    );

  const handleAddTask = async (
    e: React.FormEvent
  ) => {
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
      const createdTask =
        await createProjectTask(project.id, {
          text,
          completed: false,
        });

      setTasks((prev) => [
        createdTask,
        ...prev.filter((task) => task.id !== optimisticId),
      ]);
    } catch (error) {
      console.error(error);
      setTasks((prev) =>
        prev.filter((task) => task.id !== optimisticId)
      );
      setNewTaskText(text);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTask = async (
    id: number
  ) => {
    setActiveTaskId(id);
    let previousTasks: TaskItem[] =
      [];

    setTasks((prev) => {
      previousTasks = prev;

      return prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      );
    });

    try {
      const updatedTask =
        await toggleProjectTask(id);

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? updatedTask
            : task
        )
      );
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
    } finally {
      setActiveTaskId(null);
    }
  };

  const handleDeleteTask = async (
    id: number
  ) => {
    setActiveTaskId(id);
    let previousTasks: TaskItem[] =
      [];

    setTasks((prev) => {
      previousTasks = prev;
      return prev.filter(
        (task) => task.id !== id
      );
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

  const handleEditTask = async (task: TaskItem) => {
    const nextText = window.prompt("Edit task", task.text);
    if (nextText === null) return;

    const text = nextText.trim();
    if (!text) return;

    setActiveTaskId(task.id);
    let previousTasks: TaskItem[] = [];

    setTasks((prev) => {
      previousTasks = prev;
      return prev.map((item) =>
        item.id === task.id ? { ...item, text } : item
      );
    });

    try {
      const updatedTask = await updateProjectTask(task.id, { text });
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? updatedTask : item))
      );
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
    } finally {
      setActiveTaskId(null);
    }
  };

  return (
    <div className="relative h-screen bg-[#faf9f9] text-[#333333] overflow-hidden">
      {/* SIDEBAR */}
      <motion.aside
        animate={{
          x: sidebarOpen ? 0 : -240,
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
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
            onClick={() =>
              setSidebarOpen(false)
            }
            className="
              rounded-md p-2
              transition-all duration-200
              hover:bg-[#E5E4E2]/50
            "
          >
            <Menu
              size={20}
              className="text-[#333333]"
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {projects.map(
              (item: any) => {
                const active =
                  item.slug === slug;

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
                    <span>
                      {item.title}
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </motion.aside>

      {/* OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
            }}
            onClick={() =>
              setSidebarOpen(false)
            }
            className="fixed inset-0 bg-black/20 z-40"
          />
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main className="h-screen w-full flex flex-col overflow-hidden">
        {/* HEADER */}
        <div
          className="
            border-b border-[#E5E4E2]
            px-10 py-4
            flex items-center justify-between
          "
        >
          <button
            onClick={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
            className="
              rounded-md p-2
              transition-all duration-200
              hover:bg-[#E5E4E2]/50
              -ml-2
            "
          >
            <Menu
              size={24}
              className="text-[#333333]"
            />
          </button>

          <div className="flex-1 flex justify-center">
            <span className="text-base font-medium text-[#333333] uppercase tracking-wide">
              Mi-OS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-full bg-[#66b7ff] hover:bg-[#4fa7f8] text-white px-3 py-2 transition-colors"
              title="Create project"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {/* TITLE */}
            <div className="px-10 pt-12 pb-8">
              <h1
                className="
                  text-4xl font-semibold
                  tracking-tight
                  text-[#333333]
                "
                style={{
                  letterSpacing:
                    "-0.01em",
                }}
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
                  isBusy={activeTaskId === task.id}
                  onToggle={() =>
                    handleToggleTask(
                      task.id
                    )
                  }
                  onEdit={() =>
                    handleEditTask(task)
                  }
                  onDelete={() =>
                    handleDeleteTask(
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
              {Array.from({
                length: 12,
              }).map((_, i) => (
                <div
                  key={i}
                  className="
                    h-[58px]
                    border-b border-[#E5E4E2]
                  "
                />
              ))}
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
              placeholder={
                isCreatingTask
                  ? "Adding task..."
                  : "Add a task"
              }
              disabled={isCreatingTask}
              className="
                w-full bg-transparent
                text-[15px] text-[#333333]
                placeholder:text-[#c4c7c7]
                focus:outline-none
                disabled:opacity-60
              "
            />
          </form>
        </div>
      </main>

      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(payload) => {
          // temporary: log the created project; integrate API call as needed
          console.log("Create project", payload);
        }}
      />
    </div>
  );
}
