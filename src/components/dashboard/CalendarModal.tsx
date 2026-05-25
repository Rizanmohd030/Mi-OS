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
      color: "#dc2626",
      backgroundColor: "#fee2e2",
      border: "2px solid #fca5a5",
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
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="
          relative z-10 flex flex-col md:flex-row w-full max-w-3xl rounded-2xl
          border-2 border-[#BDDDFC] bg-white overflow-hidden shadow-lg
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 text-[#6A89A7] hover:text-[#384959]
            transition-colors duration-200 z-20 p-1.5 rounded-lg hover:bg-[#BDDDFC]
          "
        >
          <X size={16} />
        </button>

        {/* Left Side: Calendar View */}
        <div className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#BDDDFC] bg-gradient-to-br from-blue-50 to-white">
          <h4 className="text-sm font-light text-[#6A89A7] tracking-widest uppercase mb-4 self-start">
            Deadlines
          </h4>
          <Calendar
            mode="single"
            selected={new Date()}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-xl border-2 border-[#BDDDFC] bg-white p-3"
          />
        </div>

        {/* Right Side: Relative Deadlines Reminder list */}
        <div className="p-6 md:p-8 w-full md:w-80 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-light text-[#6A89A7] tracking-widest uppercase mb-6 flex items-center gap-2">
              <CalendarDays size={14} className="text-[#88BDF2]" />
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
                      group block rounded-xl border-2 border-[#BDDDFC] bg-blue-50
                      p-3.5 transition-all duration-300 hover:bg-[#BDDDFC] hover:border-[#88BDF2]
                    "
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-gray-900 font-light group-hover:text-[#384959] transition-colors">
                        {p.title}
                      </span>
                      <ArrowRight size={12} className="text-[#88BDF2] group-hover:text-[#6A89A7] group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <p className={`mt-2 text-xs font-light ${isOverdue ? "text-red-600" : "text-[#6A89A7] group-hover:text-[#384959]"}`}>
                      {getDeadlineBanner(p.parsedDeadline, p.title).split(" for ")[0]} remaining
                    </p>
                  </Link>
                );
              })}

              {projectsWithDeadlines.length === 0 && (
                <p className="text-xs font-light text-[#6A89A7] italic py-4">
                  No deadlines set for current projects.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#BDDDFC]">
            <p className="text-[11px] font-light leading-relaxed text-[#6A89A7]">
              * Red highlighted dates show project deadlines.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
