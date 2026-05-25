import DashboardLayout from "@/components/dashboard/DashboardLayout";

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
      </div>
    </DashboardLayout>
  );
}