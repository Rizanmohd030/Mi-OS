"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { createProject, deleteProject, updateProject } from "@/lib/api/projects";

const PROJECT_COLOR_KEY = "mi-os-project-colors";

const PROJECT_COLOR_OPTIONS = [
  { value: "white", swatch: "#E9E1D7" },
  { value: "black", swatch: "#111111" },
  { value: "purple", swatch: "#BF40BF" },
  { value: "orange", swatch: "#FFAA00" },
] as const;

type ProjectColorChoice = (typeof PROJECT_COLOR_OPTIONS)[number]["value"];

type ProjectModalMode = "create" | "edit" | "delete";

type ProjectModalProject = {
  id?: number;
  title: string;
  description: string;
  slug?: string;
  color?: ProjectColorChoice;
};

const writeStoredProjectColors = (slug: string, color: ProjectColorChoice) => {
  if (typeof window === "undefined") return;

  try {
    const current = JSON.parse(localStorage.getItem(PROJECT_COLOR_KEY) || "{}") as Record<string, ProjectColorChoice>;
    current[slug] = color;
    localStorage.setItem(PROJECT_COLOR_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
};

type Props = {
  open: boolean;
  onClose: () => void;
  mode?: ProjectModalMode;
  project?: ProjectModalProject | null;
  onCreated?: (created: any, color: ProjectColorChoice) => void;
  onUpdated?: (updated: any, color: ProjectColorChoice) => void;
  onDeleted?: (project: ProjectModalProject) => void;
};

export default function CreateProjectModal({
  open,
  onClose,
  mode = "create",
  project,
  onCreated,
  onUpdated,
  onDeleted,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<ProjectColorChoice>("white");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle(project?.title || "");
    setDescription(project?.description || "");
    setColor(project?.color || "white");
    setIsSubmitting(false);
    setIsDeleted(false);
  }, [open, project, mode]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (mode === "delete") {
      if (!project?.id) return;

      setIsSubmitting(true);

      try {
        await deleteProject(project.id);
        onDeleted?.(project);
        setIsDeleted(true);
      } catch (err) {
        console.error("Failed to delete project:", err);
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (!title.trim()) return;
    setIsSubmitting(true);

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      if (mode === "edit" && project?.id) {
        const updated = await updateProject(project.id, {
          title: title.trim(),
          description: description.trim() || "No description provided.",
        });

        writeStoredProjectColors(updated.slug || project.slug || slug, color);

        if (onUpdated) onUpdated(updated, color);
      } else {
        const created = await createProject({
          slug,
          title: title.trim(),
          description: description.trim() || "No description provided.",
          status: "current",
          pinned: false,
          color,
        });

        writeStoredProjectColors(created.slug, color);

        if (onCreated) onCreated(created, color);
      }

      setTitle("");
      setDescription("");
      setColor("white");
      onClose();
    } catch (err) {
      console.error(mode === "edit" ? "Failed to update project:" : "Failed to create project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleLabel = mode === "edit" ? "Edit Project" : mode === "delete" ? "Delete Project" : "Create Project";
  const submitLabel = mode === "edit" ? "Edit" : mode === "delete" ? (isDeleted ? "Deleted" : "Delete") : "Create";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative z-10 w-full max-w-md border border-[#D6D3CE] bg-[#F7F3EE] p-7 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <p className="pt-1 text-xs uppercase tracking-[0.32em] text-[#7b7771]">{titleLabel}</p>

          <button type="button" onClick={onClose} className="text-[#7b7771] transition-colors hover:text-[#373537]">
            <X size={16} />
          </button>
        </div>

        {mode === "delete" ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-[#373537]">
                {isDeleted
                  ? "The project has been deleted."
                  : `Delete project \"${project?.title || "this project"}\"?`}
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-[#7b7771]">
                {isDeleted ? "Action completed" : "This cannot be undone"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="border border-[#D6D3CE] px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#55514C] transition-colors hover:bg-black hover:text-white"
              >
                Close
              </button>

              {!isDeleted && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-black px-5 py-2 text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
                >
                  {isSubmitting ? "Deleting..." : submitLabel}
                </button>
              )}
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label className="text-[11px] uppercase tracking-[0.25em] text-[#7b7771]">Project Name</label>

                <div className="flex items-center gap-2">
                  {PROJECT_COLOR_OPTIONS.map((option) => {
                    const isSelected = color === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setColor(option.value)}
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                          isSelected ? "border-[#373537] ring-2 ring-[#373537]/25" : "border-[#D6D3CE]"
                        }`}
                      >
                        <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: option.swatch }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-[#D6D3CE] bg-transparent px-4 py-3 text-sm text-[#373537] outline-none transition-colors focus:border-[#99938C]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.25em] text-[#7b7771]">Description</label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none border border-[#D6D3CE] bg-transparent px-4 py-3 text-sm text-[#373537] outline-none transition-colors focus:border-[#99938C]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="border border-[#D6D3CE] px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#55514C] transition-colors hover:bg-black hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="bg-black px-5 py-2 text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
              >
                {isSubmitting ? (mode === "edit" ? "Editing..." : "Creating...") : submitLabel}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
