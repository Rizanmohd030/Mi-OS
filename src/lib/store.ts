import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Project {
  slug: string;
  title: string;
  description: string;
  status: "current" | "hold" | "completed";
  pinned: boolean;
  deadline: string | null; // YYYY-MM-DD
  createdAt: string;
}

export interface QuickTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface WorkspaceTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface WorkspaceNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspacePrompt {
  id: string;
  title: string;
  content: string;
  description: string;
  createdAt: string;
}

export interface WorkspaceLearning {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface WorkspaceResource {
  id: string;
  title: string;
  url: string;
  description: string;
  createdAt: string;
}

export interface ProjectWorkspace {
  tasks: WorkspaceTask[];
  notes: WorkspaceNote[];
  prompts: WorkspacePrompt[];
  learning: WorkspaceLearning[];
  resources: WorkspaceResource[];
}

interface WorkspaceState {
  projects: Project[];
  quickTasks: QuickTask[];
  workspaces: Record<string, ProjectWorkspace>;
  
  // Project Actions
  addProject: (project: Omit<Project, "createdAt">) => void;
  updateProject: (slug: string, updates: Partial<Omit<Project, "slug" | "createdAt">>) => void;
  deleteProject: (slug: string) => void;
  togglePinProject: (slug: string) => void;
  
  // Quick Tasks Actions
  addQuickTask: (text: string) => void;
  toggleQuickTask: (id: string) => void;
  deleteQuickTask: (id: string) => void;

  // Workspace Actions
  addWorkspaceTask: (slug: string, text: string) => void;
  toggleWorkspaceTask: (slug: string, id: string) => void;
  deleteWorkspaceTask: (slug: string, id: string) => void;

  addWorkspaceNote: (slug: string, title: string, content: string) => void;
  updateWorkspaceNote: (slug: string, id: string, updates: Partial<Pick<WorkspaceNote, "title" | "content">>) => void;
  deleteWorkspaceNote: (slug: string, id: string) => void;

  addWorkspacePrompt: (slug: string, title: string, content: string, description: string) => void;
  updateWorkspacePrompt: (slug: string, id: string, updates: Partial<Omit<WorkspacePrompt, "id" | "createdAt">>) => void;
  deleteWorkspacePrompt: (slug: string, id: string) => void;

  addWorkspaceLearning: (slug: string, text: string) => void;
  toggleWorkspaceLearning: (slug: string, id: string) => void;
  deleteWorkspaceLearning: (slug: string, id: string) => void;

  addWorkspaceResource: (slug: string, title: string, url: string, description: string) => void;
  updateWorkspaceResource: (slug: string, id: string, updates: Partial<Omit<WorkspaceResource, "id" | "createdAt">>) => void;
  deleteWorkspaceResource: (slug: string, id: string) => void;

  // Reset Data helper
  resetToDefault: () => void;
}

const initialProjects: Project[] = [
  {
    slug: "ai-erp",
    title: "AI ERP",
    description: "Enterprise Resource Planning system driven by LLM agents, automated supply-chains, and custom forecasting modules.",
    status: "current",
    pinned: true,
    deadline: "2026-11-26", // 6 months from current local date May 2026
    createdAt: "2026-01-15T08:30:00.000Z",
  },
  {
    slug: "react-mastery",
    title: "React Mastery",
    description: "Personal deep-dive course and custom architecture template building for modern React server capabilities.",
    status: "current",
    pinned: true,
    deadline: "2026-06-15", // ~3 weeks from current local date
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    slug: "interview-prep",
    title: "Interview Prep",
    description: "DSA problem Solving, system design blueprints, and deep backend mock sessions.",
    status: "hold",
    pinned: false,
    deadline: "2026-09-30",
    createdAt: "2026-05-10T14:20:00.000Z",
  }
];

const initialQuickTasks: QuickTask[] = [
  {
    id: "q1",
    text: "Push latest commit to repository",
    completed: false,
    createdAt: "2026-05-25T18:00:00.000Z",
  },
  {
    id: "q2",
    text: "Fix dashboard card spacing and layout",
    completed: true,
    createdAt: "2026-05-25T18:15:00.000Z",
  },
  {
    id: "q3",
    text: "Learn PostgreSQL window functions and joins",
    completed: false,
    createdAt: "2026-05-25T18:30:00.000Z",
  }
];

const initialWorkspaces: Record<string, ProjectWorkspace> = {
  "ai-erp": {
    tasks: [
      { id: "ae-t1", text: "Design agent communication protocol", completed: false, createdAt: "2026-05-20T10:00:00.000Z" },
      { id: "ae-t2", text: "Set up EF Core DbContext for ERP schema", completed: true, createdAt: "2026-05-21T11:00:00.000Z" },
      { id: "ae-t3", text: "Draft LLM tool-calling integration", completed: false, createdAt: "2026-05-22T09:00:00.000Z" },
    ],
    notes: [
      {
        id: "ae-n1",
        title: "Agent Scheduling Architecture Ideas",
        content: "We should use a background queue (like Hangfire or standard .NET BackgroundService) to poll state and dispatch agent steps. Database schema should have an `AgentTasks` table with states: Pending, Processing, Success, Failed. LLM prompt should enforce strict JSON Schema for tool invocations.",
        createdAt: "2026-05-24T14:00:00.000Z",
        updatedAt: "2026-05-24T14:30:00.000Z",
      }
    ],
    prompts: [
      {
        id: "ae-p1",
        title: "Supply Chain Planner Prompt",
        content: "You are an AI supply chain agent. Analyze the following inventory logs and demand forecasts. Propose purchase orders in JSON format:\n\n```json\n{\n  \"orders\": [\n    { \"itemId\": \"string\", \"quantity\": number, \"urgency\": \"low|medium|high\" }\n  ]\n}```",
        description: "System prompt for LLM agent ordering parts when inventory dips below minimum threshold.",
        createdAt: "2026-05-23T15:00:00.000Z",
      }
    ],
    learning: [
      { id: "ae-l1", text: "Learned how to set up PostgreSQL Row Level Security (RLS)", completed: true, createdAt: "2026-05-18T16:00:00.000Z" },
      { id: "ae-l2", text: "Deep dive on semantic search with pgvector", completed: false, createdAt: "2026-05-25T11:00:00.000Z" },
    ],
    resources: [
      {
        id: "ae-r1",
        title: "PostgreSQL pgvector Extension Docs",
        url: "https://github.com/pgvector/pgvector",
        description: "Official repository and query examples for vector embeddings in Postgres.",
        createdAt: "2026-05-20T12:00:00.000Z",
      }
    ],
  },
  "react-mastery": {
    tasks: [
      { id: "rm-t1", text: "Implement optimistic UI updates with useOptimistic", completed: false, createdAt: "2026-05-24T08:00:00.000Z" },
      { id: "rm-t2", text: "Read Next.js compilation docs on Server Actions security", completed: true, createdAt: "2026-05-24T09:00:00.000Z" },
    ],
    notes: [
      {
        id: "rm-n1",
        title: "React 19 Server Components Rules",
        content: "1. Server Components cannot import client-only APIs (like useState, useEffect, window).\n2. Keep data fetching at the page level where possible and pass down data.\n3. Wrap client subtrees in standard React Suspense boundaries to keep pages dynamic without blocking.",
        createdAt: "2026-05-25T10:00:00.000Z",
        updatedAt: "2026-05-25T10:15:00.000Z",
      }
    ],
    prompts: [
      {
        id: "rm-p1",
        title: "TypeScript React Clean Component Generator",
        content: "Generate a clean, responsive TypeScript React component using Tailwind CSS and Framer Motion. Keep logic simple and focus on modern aesthetics: clean margins, soft backgrounds, and fluid state transitions.",
        description: "Helper prompt for quick component blueprints.",
        createdAt: "2026-05-24T17:00:00.000Z",
      }
    ],
    learning: [
      { id: "rm-l1", text: "Understood React 19 Action hooks: useActionState & useFormStatus", completed: true, createdAt: "2026-05-22T14:00:00.000Z" },
    ],
    resources: [
      {
        id: "rm-r1",
        title: "React 19 Upgrade Guide",
        url: "https://react.dev/blog/2024/04/25/react-19-upgrade-guide",
        description: "Breakdown of new APIs, hooks, server-side features, and deprecations.",
        createdAt: "2026-05-21T09:00:00.000Z",
      }
    ],
  },
  "interview-prep": {
    tasks: [],
    notes: [],
    prompts: [],
    learning: [],
    resources: [],
  }
};

const ensureWorkspaceExists = (workspaces: Record<string, ProjectWorkspace>, slug: string): ProjectWorkspace => {
  if (!workspaces[slug]) {
    workspaces[slug] = {
      tasks: [],
      notes: [],
      prompts: [],
      learning: [],
      resources: [],
    };
  }
  return workspaces[slug];
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      projects: initialProjects,
      quickTasks: initialQuickTasks,
      workspaces: initialWorkspaces,

      // Project Actions
      addProject: (project) =>
        set((state) => {
          const newProject: Project = {
            ...project,
            createdAt: new Date().toISOString(),
          };
          const updatedWorkspaces = { ...state.workspaces };
          ensureWorkspaceExists(updatedWorkspaces, project.slug);
          return {
            projects: [...state.projects, newProject],
            workspaces: updatedWorkspaces,
          };
        }),

      updateProject: (slug, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.slug === slug ? { ...p, ...updates } : p
          ),
        })),

      deleteProject: (slug) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          delete updatedWorkspaces[slug];
          return {
            projects: state.projects.filter((p) => p.slug !== slug),
            workspaces: updatedWorkspaces,
          };
        }),

      togglePinProject: (slug) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.slug === slug ? { ...p, pinned: !p.pinned } : p
          ),
        })),

      // Quick Tasks Actions
      addQuickTask: (text) =>
        set((state) => ({
          quickTasks: [
            ...state.quickTasks,
            {
              id: Math.random().toString(36).substring(7),
              text,
              completed: false,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      toggleQuickTask: (id) =>
        set((state) => ({
          quickTasks: state.quickTasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      deleteQuickTask: (id) =>
        set((state) => ({
          quickTasks: state.quickTasks.filter((t) => t.id !== id),
        })),

      // Workspace Tasks
      addWorkspaceTask: (slug, text) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.tasks = [
            ...ws.tasks,
            {
              id: Math.random().toString(36).substring(7),
              text,
              completed: false,
              createdAt: new Date().toISOString(),
            },
          ];
          return { workspaces: updatedWorkspaces };
        }),

      toggleWorkspaceTask: (slug, id) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.tasks = ws.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          );
          return { workspaces: updatedWorkspaces };
        }),

      deleteWorkspaceTask: (slug, id) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.tasks = ws.tasks.filter((t) => t.id !== id);
          return { workspaces: updatedWorkspaces };
        }),

      // Workspace Notes
      addWorkspaceNote: (slug, title, content) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.notes = [
            ...ws.notes,
            {
              id: Math.random().toString(36).substring(7),
              title,
              content,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          return { workspaces: updatedWorkspaces };
        }),

      updateWorkspaceNote: (slug, id, updates) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.notes = ws.notes.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          );
          return { workspaces: updatedWorkspaces };
        }),

      deleteWorkspaceNote: (slug, id) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.notes = ws.notes.filter((n) => n.id !== id);
          return { workspaces: updatedWorkspaces };
        }),

      // Workspace Prompts
      addWorkspacePrompt: (slug, title, content, description) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.prompts = [
            ...ws.prompts,
            {
              id: Math.random().toString(36).substring(7),
              title,
              content,
              description,
              createdAt: new Date().toISOString(),
            },
          ];
          return { workspaces: updatedWorkspaces };
        }),

      updateWorkspacePrompt: (slug, id, updates) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.prompts = ws.prompts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          );
          return { workspaces: updatedWorkspaces };
        }),

      deleteWorkspacePrompt: (slug, id) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.prompts = ws.prompts.filter((p) => p.id !== id);
          return { workspaces: updatedWorkspaces };
        }),

      // Workspace Learning
      addWorkspaceLearning: (slug, text) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.learning = [
            ...ws.learning,
            {
              id: Math.random().toString(36).substring(7),
              text,
              completed: false,
              createdAt: new Date().toISOString(),
            },
          ];
          return { workspaces: updatedWorkspaces };
        }),

      toggleWorkspaceLearning: (slug, id) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.learning = ws.learning.map((l) =>
            l.id === id ? { ...l, completed: !l.completed } : l
          );
          return { workspaces: updatedWorkspaces };
        }),

      deleteWorkspaceLearning: (slug, id) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.learning = ws.learning.filter((l) => l.id !== id);
          return { workspaces: updatedWorkspaces };
        }),

      // Workspace Resources
      addWorkspaceResource: (slug, title, url, description) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.resources = [
            ...ws.resources,
            {
              id: Math.random().toString(36).substring(7),
              title,
              url,
              description,
              createdAt: new Date().toISOString(),
            },
          ];
          return { workspaces: updatedWorkspaces };
        }),

      updateWorkspaceResource: (slug, id, updates) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.resources = ws.resources.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          );
          return { workspaces: updatedWorkspaces };
        }),

      deleteWorkspaceResource: (slug, id) =>
        set((state) => {
          const updatedWorkspaces = { ...state.workspaces };
          const ws = ensureWorkspaceExists(updatedWorkspaces, slug);
          ws.resources = ws.resources.filter((r) => r.id !== id);
          return { workspaces: updatedWorkspaces };
        }),

      resetToDefault: () =>
        set(() => ({
          projects: initialProjects,
          quickTasks: initialQuickTasks,
          workspaces: initialWorkspaces,
        })),
    }),
    {
      name: "mi-os-workspace-storage",
    }
  )
);
