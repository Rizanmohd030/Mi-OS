type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#faf9f9] text-[#333333] selection:bg-[#d8e2ff] selection:text-[#001a42] antialiased">
      {/* Soft background accent - removed for cleaner minimalist aesthetic */}
      
      <div className="relative z-10 w-full px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
        {children}
      </div>
    </div>
  );
}
