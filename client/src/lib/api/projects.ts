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
  slug:string;
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

export async function getProjectBySlug(slug: string) {
  const response = await fetch(`${API_URL}/${slug}`);

  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }

  return response.json();
}

export async function togglePinProject(id: number) {
  const response = await fetch(
    `${API_URL}/${id}/pin`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to toggle pin"
    );
  }

  return response.json();
}