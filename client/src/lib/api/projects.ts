const API_URL = "http://localhost:5047/api/projects";

export async function getProjects() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
}

export async function createProject(data: {
  title: string;
  description: string;
  status: string;
  pinned: boolean;
}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return response.json();
}