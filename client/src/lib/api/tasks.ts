const API_URL =
  "http://localhost:5047/api/Tasks";

export type GlobalTask = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
};

export async function getTasks(
) {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(
      "Failed to fetch tasks"
    );
  }

  return response.json() as Promise<GlobalTask[]>;
}

export async function createTask(
  data: {
    text: string;
    completed: boolean;
  }
) {
  const response = await fetch(
    API_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to create task"
    );
  }

  return response.json() as Promise<GlobalTask>;
}

export async function updateTask(
  id: number,
  data: {
    text?: string;
    completed?: boolean;
  }
) {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to update task"
    );
  }

  return response.json() as Promise<GlobalTask>;
}

export async function toggleTask(
  id: number
) {
  const response = await fetch(
    `${API_URL}/${id}/toggle`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to toggle task"
    );
  }

  return response.json() as Promise<GlobalTask>;
}

export async function deleteTask(
  id: number
) {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete task"
    );
  }
}
