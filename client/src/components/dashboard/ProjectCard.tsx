"use client";

import { Pin } from "lucide-react";
import Link from "next/link";
import { Project, useWorkspaceStore } from "@/lib/store";
import { formatDistanceToNow, parseISO } from "date-fns";

type ProjectCardProps = {
  project: Project;
  colorIndex?: number;
};

const PASTEL_COLORS = [
  { bg: "bg-pink-100", border: "border-pink-200", header: "bg-pink-300", text: "text-pink-900" },
  { bg: "bg-purple-100", border: "border-purple-200", header: "bg-purple-300", text: "text-purple-900" },
  { bg: "bg-yellow-100", border: "border-yellow-200", header: "bg-yellow-300", text: "text-yellow-900" },
  { bg: "bg-blue-100", border: "border-blue-200", header: "bg-blue-300", text: "text-blue-900" },
  { bg: "bg-green-100", border: "border-green-200", header: "bg-green-300", text: "text-green-900" },
  { bg: "bg-orange-100", border: "border-orange-200", header: "bg-orange-300", text: "text-orange-900" },
];

export default function ProjectCard({ project, colorIndex = 0 }: ProjectCardProps) {
  const { togglePinProject } = useWorkspaceStore();
  const { title, description, slug, pinned, status, deadline } = project;
  const color = PASTEL_COLORS[colorIndex % PASTEL_COLORS.length];

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
    current: "bg-green-100 text-green-700 border-green-300",
    hold: "bg-amber-100 text-amber-700 border-amber-300",
    completed: "bg-gray-100 text-gray-700 border-gray-300",
  };

  const statusLabels = {
    current: "Current",
    hold: "On Hold",
    completed: "Completed",
  };

  return (
    <Link
      href={`/Workspace/${slug}`}
      className={`
        group relative block rounded-2xl
        border-2 ${color.border}
        ${color.bg} p-0 overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-lg hover:-translate-y-1
      `}
    >
      {/* Header */}
      <div className={`${color.header} ${color.text} px-6 py-3 flex items-center justify-between`}>
        <h2 className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <button
          onClick={handlePinClick}
          className={`
            rounded-full p-1.5 transition-all duration-300
            hover:bg-white/30
            ${pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
          title={pinned ? "Unpin project" : "Pin project"}
        >
          <Pin size={14} className={pinned ? "fill-current" : ""} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col h-full justify-between gap-6">
        <p className="text-sm leading-relaxed text-gray-700 font-light line-clamp-3">
          {description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-black/10">
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
              <p className="text-[11px] text-gray-600 font-light uppercase tracking-wider">
                Deadline
              </p>
              <p className={`text-xs font-light ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
                {deadlineText}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
