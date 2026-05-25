"use client";
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProjectCard from "@/components/dashboard/ProjectCard";
import CalendarButton from "@/components/dashboard/CalendarButton";
import CalendarModal from "@/components/dashboard/CalendarModal";



export default function Home() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  return (
    <DashboardLayout>
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              Rizan's Workspace
            </h1>

            <p className="mt-3 text-lg text-white/60">
              Personal project operating system
            </p>
          </div>

          <CalendarButton onClick={() => setIsCalendarOpen(true)}
/>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ProjectCard
            title="AI ERP"
            description="AI-powered ERP platform project"
            pinned
          />

          <ProjectCard
            title="React Mastery"
            description="Frontend learning and architecture"
            pinned
          />

          <ProjectCard
            title="Interview Prep"
            description="DSA, system design and backend prep"
          />
        </div>
      </div>
      <CalendarModal open={isCalendarOpen} onClose={() => setIsCalendarOpen(false)}
/>
    </DashboardLayout>
  );
}