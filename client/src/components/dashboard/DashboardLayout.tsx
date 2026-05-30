type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
     <div className="min-h-screen bg-background text-foreground selection:bg-[#d8e2ff] selection:text-[#001a42] antialiased">
      {children}
    </div>
  );
}
