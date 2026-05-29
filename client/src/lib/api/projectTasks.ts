const PROJECTS_API_URL = "http://localhost:5047/api/projects";
const PROJECT_TASKS_API_URL = "http://localhost:5047/api/project-tasks";

export type ProjectTask = {
  id: number;
  projectId: number;
  text: string;
  completed: boolean;
  createdAt: string;
};

export async function getProjectTasks(projectId: number) {
  const response = await fetch(`${PROJECTS_API_URL}/${projectId}/tasks`);

  if (!response.ok) {
    throw new Error("Failed to fetch project tasks");
  }

  return response.json() as Promise<ProjectTask[]>;
}

export async function createProjectTask(
  projectId: number,
  data: {
    text: string;
    completed: boolean;
  }
) {
  const response = await fetch(`${PROJECTS_API_URL}/${projectId}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create project task");
  }

  return response.json() as Promise<ProjectTask>;
}

export async function toggleProjectTask(id: number) {
  const response = await fetch(`${PROJECT_TASKS_API_URL}/${id}/toggle`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Failed to toggle project task");
  }

  return response.json() as Promise<ProjectTask>;
}

export async function updateProjectTask(
  id: number,
  data: {
    text?: string;
    completed?: boolean;
  }
) {
  const response = await fetch(`${PROJECT_TASKS_API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update project task");
  }

  return response.json() as Promise<ProjectTask>;
}

export async function deleteProjectTask(id: number) {
  const response = await fetch(`${PROJECT_TASKS_API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete project task");
  }
}
