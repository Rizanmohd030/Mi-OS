import { notFound } from "next/navigation";

import WorkspaceClient from "./WorkspaceClient";
import { getProjects, getProjectBySlug } from "@/lib/api/projects";
import { getProjectTasks } from "@/lib/api/projectTasks";

type WorkspacePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { slug } = await params;

  const [project, projects] = await Promise.all([
    getProjectBySlug(slug).catch(() => null),
    getProjects().catch(() => []),
  ]);

  if (!project) {
    notFound();
  }

  const tasks = await getProjectTasks(project.id).catch(() => []);

  return (
    <WorkspaceClient
      slug={slug}
      project={project}
      projects={projects}
      tasks={tasks}
    />
  );
}
