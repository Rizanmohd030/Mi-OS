type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-gray-900 antialiased">
      {/* Soft background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] right-[10%] w-[40%] h-[50%] rounded-full bg-blue-100/30 blur-[140px]" />
      </div>
      
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 sm:px-8 md:py-24">
        {children}
      </div>
    </div>
  );
}
