const API_URL =
  "http://localhost:5047/api/Tasks";

export async function getTasks(
  slug: string
) {
  const response = await fetch(
    `${API_URL}/${slug}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch tasks"
    );
  }

  return response.json();
}

export async function createTask(
  data: {
    projectSlug: string;
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

  return response.json();
}