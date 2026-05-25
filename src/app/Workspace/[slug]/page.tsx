type WorkspacePageProps = {
  params: {
    slug: string;
  };
};

export default function WorkspacePage({
  params,
}: WorkspacePageProps) {
  return (
    <main className="min-h-screen bg-[#0B0F19] text-white">
      <div className="mx-auto max-w-5xl px-8 py-10">
        <h1 className="text-5xl font-bold tracking-tight">
          {params.slug}
        </h1>

        <p className="mt-3 text-white/60">
          Project workspace
        </p>
      </div>
    </main>
  );
}