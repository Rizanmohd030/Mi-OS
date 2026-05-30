"use client";
import { deleteProject, togglePinProject, updateProject } from "@/lib/api/projects";
import { Pencil, Pin, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Project } from "@/lib/store";
import { formatDistanceToNow, parseISO } from "date-fns";

type ProjectCardProps = {
  project: Project;
  colorIndex?: number;
  onPin?: (project: Project) => void | Promise<void>;
};

const CARD_COLOR_STYLES = {
  white: {
    bg: "bg-[#E9E1D7]",
    border: "border-[#D6D3CE]",
    header: "bg-[#EFE7DB]",
    text: "text-[#111111]",
    mutedText: "text-[#6B645B]",
    bodyText: "text-[#111111]",
  },
  black: {
    bg: "bg-[#111111]",
    border: "border-white/10",
    header: "bg-white/[0.03]",
    text: "text-white",
    mutedText: "text-white/70",
    bodyText: "text-white",
  },
  purple: {
    bg: "bg-[#BF40BF]",
    border: "border-white/15",
    header: "bg-white/10",
    text: "text-white",
    mutedText: "text-white/75",
    bodyText: "text-white",
  },
  orange: {
    bg: "bg-[#FFAA00]",
    border: "border-black/10",
    header: "bg-white/15",
    text: "text-[#1A1A1A]",
    mutedText: "text-[#2D2617]/75",
    bodyText: "text-[#1A1A1A]",
  },
} as const;

const FALLBACK_CARD_KEYS = ["white", "black", "purple", "orange"] as const;

export default function ProjectCard({ project, colorIndex = 0, onPin }: ProjectCardProps) {
  const router = useRouter();
  
  const { title, description, slug, pinned, status, deadline } = project;
  const colorKey =
    (project.color && project.color in CARD_COLOR_STYLES
      ? project.color
      : FALLBACK_CARD_KEYS[colorIndex % FALLBACK_CARD_KEYS.length]) as keyof typeof CARD_COLOR_STYLES;
  const color = CARD_COLOR_STYLES[colorKey];
  const href = `/Workspace/${slug}`;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  const handleEditClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextTitle = window.prompt("Edit project title", title);
    if (nextTitle === null) return;

    const nextDescription = window.prompt("Edit project description", description);
    if (nextDescription === null) return;

    const trimmedTitle = nextTitle.trim();
    if (!trimmedTitle) return;

    try {
      await updateProject(project.id, {
        title: trimmedTitle,
        description: nextDescription.trim(),
      });
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(`Delete project "${title}"?`);
    if (!confirmed) return;

    try {
      await deleteProject(project.id);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

 const handlePinClick = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  try {
    if (onPin) {
      await onPin(project);
      return;
    }

    await togglePinProject(project.id);
  } catch (error) {
    console.error(error);
  }
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
      href={href}
      onClick={handleCardClick}
      className={`group relative block w-full h-full rounded-none border ${color.border} ${color.bg} p-0 overflow-hidden transition-colors duration-200 ease-out hover:border-white/20`}
    >
      {/* Header */}
      <div className={`${color.header} ${color.text} px-6 py-3 flex items-center justify-between`}>
        <h2 className="text-lg font-bold tracking-tight uppercase">
          {title}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={handlePinClick} className={`p-1 transition-opacity duration-200 ${pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} title={pinned ? "Unpin project" : "Pin project"}><Pin size={14} /></button>
          <button onClick={handleEditClick} className="p-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100" title="Edit project"><Pencil size={14} /></button>
          <button onClick={handleDeleteClick} className="p-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100" title="Delete project"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col h-full justify-between gap-6">
        <p className={`text-sm leading-relaxed font-normal line-clamp-3 ${color.bodyText}`}>
          {description}
        </p>

        <div className={`flex items-center justify-between pt-4 border-t ${colorKey === "white" ? "border-[#CFC9C0]" : "border-white/10"}`}>
          <span className={`inline-block border px-2.5 py-0.5 text-xs font-medium tracking-wide ${statusStyles[status] || statusStyles.current}`}>
            {statusLabels[status] || status}
          </span>

          {deadline && (
            <div className="text-right">
              <p className={`text-[11px] font-medium uppercase tracking-wider ${color.mutedText}`}>
                Deadline
              </p>
              <p className={`text-xs font-medium ${isOverdue ? "text-red-400" : colorKey === "white" || colorKey === "orange" ? "text-[#1A1A1A]" : "text-white/90"}`}>
                {deadlineText}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
