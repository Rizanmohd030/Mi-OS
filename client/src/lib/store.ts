import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Project {
  id: number;

  slug: string;

  title: string;

  description: string;

  status: "current" | "hold" | "completed";

  pinned: boolean;

  deadline: string | null;

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

export interface MoodEntry {
  date: string;
  mood: string;
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

  moodEntries: MoodEntry[];

  // Quick Tasks
  addQuickTask: (text: string) => void;

  toggleQuickTask: (id: string) => void;

  deleteQuickTask: (id: string) => void;

  // Workspace Tasks
  addWorkspaceTask: (
    slug: string,
    text: string
  ) => void;

  toggleWorkspaceTask: (
    slug: string,
    id: string
  ) => void;

  deleteWorkspaceTask: (
    slug: string,
    id: string
  ) => void;

  // Notes
  addWorkspaceNote: (
    slug: string,
    title: string,
    content: string
  ) => void;

  updateWorkspaceNote: (
    slug: string,
    id: string,
    updates: Partial<
      Pick<
        WorkspaceNote,
        "title" | "content"
      >
    >
  ) => void;

  deleteWorkspaceNote: (
    slug: string,
    id: string
  ) => void;

  // Prompts
  addWorkspacePrompt: (
    slug: string,
    title: string,
    content: string,
    description: string
  ) => void;

  updateWorkspacePrompt: (
    slug: string,
    id: string,
    updates: Partial<
      Omit<
        WorkspacePrompt,
        "id" | "createdAt"
      >
    >
  ) => void;

  deleteWorkspacePrompt: (
    slug: string,
    id: string
  ) => void;

  // Learning
  addWorkspaceLearning: (
    slug: string,
    text: string
  ) => void;

  toggleWorkspaceLearning: (
    slug: string,
    id: string
  ) => void;

  deleteWorkspaceLearning: (
    slug: string,
    id: string
  ) => void;

  // Resources
  addWorkspaceResource: (
    slug: string,
    title: string,
    url: string,
    description: string
  ) => void;

  updateWorkspaceResource: (
    slug: string,
    id: string,
    updates: Partial<
      Omit<
        WorkspaceResource,
        "id" | "createdAt"
      >
    >
  ) => void;

  deleteWorkspaceResource: (
    slug: string,
    id: string
  ) => void;

  // Mood
  addMoodEntry: (
    date: string,
    mood: string
  ) => void;

  deleteMoodEntry: (
    date: string
  ) => void;

  resetToDefault: () => void;
}

const initialQuickTasks: QuickTask[] = [
  {
    id: "q1",
    text: "Push latest commit to repository",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const initialWorkspaces: Record<
  string,
  ProjectWorkspace
> = {};

const ensureWorkspaceExists = (
  workspaces: Record<
    string,
    ProjectWorkspace
  >,
  slug: string
): ProjectWorkspace => {
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

export const useWorkspaceStore =
  create<WorkspaceState>()(
    persist(
      (set) => ({
        projects: [],

        quickTasks: initialQuickTasks,

        workspaces: initialWorkspaces,

        moodEntries: [],

        // Quick Tasks
        addQuickTask: (text) =>
          set((state) => ({
            quickTasks: [
              ...state.quickTasks,
              {
                id: Math.random()
                  .toString(36)
                  .substring(7),

                text,

                completed: false,

                createdAt:
                  new Date().toISOString(),
              },
            ],
          })),

        toggleQuickTask: (id) =>
          set((state) => ({
            quickTasks:
              state.quickTasks.map((t) =>
                t.id === id
                  ? {
                      ...t,
                      completed:
                        !t.completed,
                    }
                  : t
              ),
          })),

        deleteQuickTask: (id) =>
          set((state) => ({
            quickTasks:
              state.quickTasks.filter(
                (t) => t.id !== id
              ),
          })),

        // Workspace Tasks
        addWorkspaceTask: (
          slug,
          text
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.tasks = [
              ...ws.tasks,
              {
                id: Math.random()
                  .toString(36)
                  .substring(7),

                text,

                completed: false,

                createdAt:
                  new Date().toISOString(),
              },
            ];

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        toggleWorkspaceTask: (
          slug,
          id
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.tasks = ws.tasks.map(
              (t) =>
                t.id === id
                  ? {
                      ...t,
                      completed:
                        !t.completed,
                    }
                  : t
            );

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        deleteWorkspaceTask: (
          slug,
          id
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.tasks = ws.tasks.filter(
              (t) => t.id !== id
            );

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        // Notes
        addWorkspaceNote: (
          slug,
          title,
          content
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.notes = [
              ...ws.notes,
              {
                id: Math.random()
                  .toString(36)
                  .substring(7),

                title,

                content,

                createdAt:
                  new Date().toISOString(),

                updatedAt:
                  new Date().toISOString(),
              },
            ];

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        updateWorkspaceNote: (
          slug,
          id,
          updates
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.notes = ws.notes.map(
              (n) =>
                n.id === id
                  ? {
                      ...n,
                      ...updates,
                      updatedAt:
                        new Date().toISOString(),
                    }
                  : n
            );

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        deleteWorkspaceNote: (
          slug,
          id
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.notes =
              ws.notes.filter(
                (n) => n.id !== id
              );

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        // Prompts
        addWorkspacePrompt: (
          slug,
          title,
          content,
          description
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.prompts = [
              ...ws.prompts,
              {
                id: Math.random()
                  .toString(36)
                  .substring(7),

                title,

                content,

                description,

                createdAt:
                  new Date().toISOString(),
              },
            ];

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        updateWorkspacePrompt: (
          slug,
          id,
          updates
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.prompts =
              ws.prompts.map((p) =>
                p.id === id
                  ? {
                      ...p,
                      ...updates,
                    }
                  : p
              );

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        deleteWorkspacePrompt: (
          slug,
          id
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.prompts =
              ws.prompts.filter(
                (p) => p.id !== id
              );

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        // Learning
        addWorkspaceLearning: (
          slug,
          text
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.learning = [
              ...ws.learning,
              {
                id: Math.random()
                  .toString(36)
                  .substring(7),

                text,

                completed: false,

                createdAt:
                  new Date().toISOString(),
              },
            ];

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        toggleWorkspaceLearning: (
          slug,
          id
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.learning =
              ws.learning.map((l) =>
                l.id === id
                  ? {
                      ...l,
                      completed:
                        !l.completed,
                    }
                  : l
              );

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        deleteWorkspaceLearning: (
          slug,
          id
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.learning =
              ws.learning.filter(
                (l) => l.id !== id
              );

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        // Resources
        addWorkspaceResource: (
          slug,
          title,
          url,
          description
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.resources = [
              ...ws.resources,
              {
                id: Math.random()
                  .toString(36)
                  .substring(7),

                title,

                url,

                description,

                createdAt:
                  new Date().toISOString(),
              },
            ];

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        updateWorkspaceResource: (
          slug,
          id,
          updates
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.resources =
              ws.resources.map((r) =>
                r.id === id
                  ? {
                      ...r,
                      ...updates,
                    }
                  : r
              );

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        deleteWorkspaceResource: (
          slug,
          id
        ) =>
          set((state) => {
            const updatedWorkspaces =
              {
                ...state.workspaces,
              };

            const ws =
              ensureWorkspaceExists(
                updatedWorkspaces,
                slug
              );

            ws.resources =
              ws.resources.filter(
                (r) => r.id !== id
              );

            return {
              workspaces:
                updatedWorkspaces,
            };
          }),

        // Mood
        addMoodEntry: (
          date,
          mood
        ) =>
          set((state) => {
            const existingIndex =
              state.moodEntries.findIndex(
                (m) => m.date === date
              );

            if (existingIndex >= 0) {
              const updated = [
                ...state.moodEntries,
              ];

              updated[existingIndex] =
                {
                  date,
                  mood,
                };

              return {
                moodEntries: updated,
              };
            }

            return {
              moodEntries: [
                ...state.moodEntries,
                {
                  date,
                  mood,
                },
              ],
            };
          }),

        deleteMoodEntry: (date) =>
          set((state) => ({
            moodEntries:
              state.moodEntries.filter(
                (m) => m.date !== date
              ),
          })),

        resetToDefault: () =>
          set(() => ({
            projects: [],

            quickTasks:
              initialQuickTasks,

            workspaces:
              initialWorkspaces,

            moodEntries: [],
          })),
      }),
      {
        name: "mi-os-workspace-storage",
      }
    )
  );