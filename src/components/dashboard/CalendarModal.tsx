"use client";

import { motion } from "framer-motion";
import { X, CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { useWorkspaceStore } from "@/lib/store";
import { formatDistanceToNow, parseISO, isSameDay } from "date-fns";

type CalendarModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CalendarModal({ open, onClose }: CalendarModalProps) {
  const { projects } = useWorkspaceStore();

  if (!open) return null;

  // Filter projects that have deadlines
  const projectsWithDeadlines = projects
    .filter((p) => p.deadline)
    .map((p) => ({
      ...p,
      parsedDeadline: parseISO(p.deadline!),
    }))
    .sort((a, b) => a.parsedDeadline.getTime() - b.parsedDeadline.getTime());

  // Function to calculate relative time
  const getDeadlineBanner = (date: Date, title: string) => {
    const now = new Date();
    if (date < now) {
      return `Overdue: ${title}`;
    }
    const distance = formatDistanceToNow(date);
    return `${distance} remaining for ${title}`;
  };

  // Custom modifiers for Calendar to highlight deadlines
  const deadlineDates = projectsWithDeadlines.map((p) => p.parsedDeadline);
  
  const modifiers = {
    deadline: (date: Date) => 
      deadlineDates.some((dDate) => isSameDay(dDate, date))
  };

  const modifiersStyles = {
    deadline: {
      fontWeight: "bold",
      color: "var(--foreground)",
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "8px"
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="
          relative z-10 flex flex-col md:flex-row w-full max-w-3xl rounded-2xl
          border border-white/[0.06] bg-[#0E121A] overflow-hidden shadow-2xl
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 text-slate-500 hover:text-slate-300
            transition-colors duration-200 z-20 p-1.5 rounded-lg hover:bg-white/5
          "
        >
          <X size={16} />
        </button>

        {/* Left Side: Calendar View */}
        <div className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/[0.04]">
          <h4 className="text-sm font-light text-slate-400 tracking-widest uppercase mb-4 self-start">
            Schedule
          </h4>
          <Calendar
            mode="single"
            selected={new Date()}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-xl border border-white/[0.02] bg-white/[0.01] p-3"
          />
        </div>

        {/* Right Side: Relative Deadlines Reminder list */}
        <div className="p-6 md:p-8 w-full md:w-80 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-light text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-2">
              <CalendarDays size={14} className="text-slate-500" />
              Reminders
            </h4>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {projectsWithDeadlines.map((p) => {
                const isOverdue = p.parsedDeadline < new Date();
                return (
                  <Link
                    key={p.slug}
                    href={`/Workspace/${p.slug}`}
                    onClick={onClose}
                    className="
                      group block rounded-xl border border-white/[0.03] bg-white/[0.01]
                      p-3.5 transition-all duration-300 hover:bg-white/[0.03] hover:border-white/[0.08]
                    "
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-slate-300 font-light group-hover:text-slate-100 transition-colors">
                        {p.title}
                      </span>
                      <ArrowRight size={12} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <p className={`mt-2 text-xs font-light ${isOverdue ? "text-red-400/80" : "text-slate-500 group-hover:text-slate-400"}`}>
                      {getDeadlineBanner(p.parsedDeadline, p.title).split(" for ")[0]} remaining
                    </p>
                  </Link>
                );
              })}

              {projectsWithDeadlines.length === 0 && (
                <p className="text-xs font-light text-slate-500 italic py-4">
                  No deadlines set for current projects.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.03]">
            <p className="text-[11px] font-light leading-relaxed text-slate-600">
              * Deadlines highlighted on the calendar indicate major milestones and project release boundaries.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}