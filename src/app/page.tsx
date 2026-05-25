import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProjectCard from "@/components/dashboard/ProjectCard";


export default function Home() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-5xl font-bold tracking-tight">
          Rizan's Workspace
        </h1>

        <p className="mt-3 text-lg text-white/60">
          Personal project operating system
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <ProjectCard
      title="AI ERP"
      description="AI-powered ERP platform project"
      pinned
    />

    <ProjectCard
      title="React Mastery"
      description="Frontend learning and architecture"
    />

    <ProjectCard
      title="Interview Prep"
      description="DSA, system design and backend prep"
    />
  </div>
      </div>
    </DashboardLayout>
  );
}