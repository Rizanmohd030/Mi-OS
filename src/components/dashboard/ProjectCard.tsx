"use client";

import { Pin } from "lucide-react";
import Link from "next/link";
import { Project, useWorkspaceStore } from "@/lib/store";
import { formatDistanceToNow, parseISO } from "date-fns";

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const { togglePinProject } = useWorkspaceStore();
  const { title, description, slug, pinned, status, deadline } = project;

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    togglePinProject(slug);
  };

  // Human readable deadline countdown
  let deadlineText = "";
  let isOverdue = false;
  if (deadline) {
    try {
      const deadlineDate = parseISO(deadline);
      const now = new Date();
      if (deadlineDate < now) {
        deadlineText = "Overdue";
        isOverdue = true;
      } else {
        const distance = formatDistanceToNow(deadlineDate);
        deadlineText = `${distance} remaining`;
      }
    } catch {
      deadlineText = deadline;
    }
  }

  // Soft styling for statuses
  const statusStyles = {
    current: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    hold: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    completed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  };

  const statusLabels = {
    current: "Current",
    hold: "On Hold",
    completed: "Completed",
  };

  return (
    <Link
      href={`/Workspace/${slug}`}
      className="
        group relative block rounded-2xl
        border border-white/[0.04]
        bg-white/[0.01] p-6
        transition-all duration-300 ease-out
        hover:bg-white/[0.02]
        hover:border-white/[0.08]
        hover:-translate-y-1
      "
    >
      <div className="flex flex-col h-full justify-between gap-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-medium tracking-tight text-slate-200 group-hover:text-white transition-colors duration-300">
              {title}
            </h2>

            <button
              onClick={handlePinClick}
              className={`
                rounded-full p-1.5 transition-all duration-300
                hover:bg-white/10
                ${pinned ? "text-slate-300" : "text-slate-600 opacity-0 group-hover:opacity-100"}
              `}
              title={pinned ? "Unpin project" : "Pin project"}
            >
              <Pin size={14} className={pinned ? "fill-slate-300" : ""} />
            </button>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-slate-400 font-light line-clamp-3">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.03]">
          <span
            className={`
              rounded-full border px-2.5 py-0.5 text-xs font-light tracking-wide
              ${statusStyles[status] || statusStyles.current}
            `}
          >
            {statusLabels[status] || status}
          </span>

          {deadline && (
            <div className="text-right">
              <p className="text-[11px] text-slate-500 font-light uppercase tracking-wider">
                Deadline
              </p>
              <p className={`text-xs font-light ${isOverdue ? "text-red-400" : "text-slate-400"}`}>
                {deadlineText}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}