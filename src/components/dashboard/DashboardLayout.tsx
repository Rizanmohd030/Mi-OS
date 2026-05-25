type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05070C] via-[#090D16] to-[#05070C] text-slate-100 selection:bg-slate-800 selection:text-slate-200 antialiased">
      {/* Soft background ambient blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] left-[20%] w-[60%] h-[60%] rounded-full bg-slate-900/10 blur-[140px]" />
      </div>
      
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 sm:px-8 md:py-24">
        {children}
      </div>
    </div>
  );
}