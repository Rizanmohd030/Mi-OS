"use client";

import { Check, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

type QuickTaskProps = {
  text: string;
  completed?: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
};

export default function QuickTask({
  text,
  completed = false,
  onToggle,
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
                ? "text-slate-600 line-through font-light"
                : "text-slate-300 font-light hover:text-slate-200"
            }
          `}
        >
          {text}
        </span>
      </div>

      {onDelete && (
        <button
          onClick={onDelete}
          className="
            text-slate-600 hover:text-red-400
            opacity-0 group-hover:opacity-100
            transition-all duration-200 p-1 rounded-lg
            hover:bg-white/[0.04] focus:opacity-100
          "
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      )}
    </motion.div>
  );
}