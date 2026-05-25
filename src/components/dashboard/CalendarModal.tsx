"use client";

import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";

type CalendarModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CalendarModal({
  open,
  onClose,
}: CalendarModalProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
      "
    >
      <div
        onClick={onClose}
        className="
          absolute inset-0
          bg-black/40
          backdrop-blur-sm
        "
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="
          relative z-10 rounded-[32px]
          border border-white/10
          bg-[#111827]
          p-6 shadow-2xl
        "
      >
        <Calendar mode="single" selected={new Date()} />

      </motion.div>
    </div>
  );
}