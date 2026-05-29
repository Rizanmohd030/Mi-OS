"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

type QuickTaskProps = {
  text: string;
  completed?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function QuickTask({
  text,
  completed = false,
  onToggle,
  onEdit,
  onDelete,
}: QuickTaskProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group flex items-center justify-between py-3.5 border-b border-white/[0.02]"
    >
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onToggle}
          className={`
            flex h-5 w-5 items-center justify-center rounded-full border
            transition-all duration-300 ease-out focus:outline-none
            ${
              completed
                ? "border-slate-500 bg-slate-800 text-slate-300"
                : "border-slate-700 hover:border-slate-500 bg-transparent text-transparent"
            }
          `}
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

        <span
          onClick={onToggle}
          className={`
            text-sm tracking-wide cursor-pointer transition-all duration-300 select-none
            ${
              completed
                ? "text-slate-600 line-through decoration-slate-500 decoration-1 font-light"
                : "text-slate-300 font-light hover:text-slate-200"
            }
          `}
        >
          {text}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        {onEdit && (
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-white/[0.04] hover:text-slate-200 focus:outline-none"
            title="Edit task"
          >
            <Pencil size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-white/[0.04] hover:text-red-400 focus:outline-none"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
