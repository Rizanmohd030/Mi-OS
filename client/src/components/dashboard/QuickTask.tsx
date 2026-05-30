"use client";

import { Check, Pencil, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";

type QuickTaskProps = {
  text: string;
  completed?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editing?: boolean;
  editValue?: string;
  onEditChange?: (value: string) => void;
  onEditSubmit?: () => void;
  onEditCancel?: () => void;
};

export default function QuickTask({
  text,
  completed = false,
  onToggle,
  onEdit,
  onDelete,
  editing = false,
  editValue = "",
  onEditChange,
  onEditSubmit,
  onEditCancel,
}: QuickTaskProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group flex items-start justify-between gap-4 py-3.5 border-b border-white/[0.02]"
    >
      <div className="flex flex-1 min-w-0 items-start gap-4">
        <button
          onClick={onToggle}
          type="button"
          className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ease-out focus:outline-none ${
            completed
              ? "border-slate-500 bg-slate-800 text-slate-300"
              : "border-slate-700 bg-transparent text-transparent hover:border-slate-500"
          }`}
        >
          {completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Check size={12} strokeWidth={3} />
            </motion.div>
          )}
        </button>

        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onEditSubmit?.();
            }}
            className="flex flex-1 min-w-0 items-start gap-3"
          >
            <input
              autoFocus
              value={editValue}
              onChange={(e) => onEditChange?.(e.target.value)}
              className="flex-1 min-w-0 border-0 bg-transparent text-sm tracking-wide leading-relaxed text-slate-900 outline-none"
            />

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="submit"
                className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-white/[0.04] hover:text-slate-200 focus:outline-none"
                title="Save task"
              >
                <Check size={14} />
              </button>

              <button
                type="button"
                onClick={onEditCancel}
                className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-white/[0.04] hover:text-slate-200 focus:outline-none"
                title="Cancel edit"
              >
                <X size={14} />
              </button>
            </div>
          </form>
        ) : (
          <span
            className={`flex-1 min-w-0 cursor-text text-sm tracking-wide leading-relaxed transition-all duration-300 select-text whitespace-normal break-words ${
              completed
                ? "text-slate-800 line-through decoration-slate-500 decoration-1 font-light"
                : "text-slate-900 font-light hover:text-slate-700"
            }`}
          >
            {text}
          </span>
        )}
      </div>

      {!editing && (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-white/[0.04] hover:text-slate-200 focus:outline-none"
              title="Edit task"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-white/[0.04] hover:text-red-400 focus:outline-none"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
