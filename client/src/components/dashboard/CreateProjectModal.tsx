"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate?: (payload: { title: string; description?: string }) => void;
};

export default function CreateProjectModal({
  open,
  onClose,
  onCreate,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const payload = { title: title.trim(), description: description.trim() };
      if (onCreate) await onCreate(payload as any);
      // brief delay for nicer UX
      await new Promise((r) => setTimeout(r, 250));
      setTitle("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.35 }}
        className="relative z-10 w-full max-w-2xl rounded-2xl border-2 border-[#BDDDFC] bg-white shadow-lg create-project-modal"
      >
        <style>{`
          .create-project-modal {
            color: #0f172a !important;
          }

          .create-project-modal input,
          .create-project-modal textarea {
            color: #0f172a !important;
            -webkit-text-fill-color: #0f172a !important;
            opacity: 1 !important;
          }

          .create-project-modal input::placeholder,
          .create-project-modal textarea::placeholder,
          .create-project-modal input::-webkit-input-placeholder,
          .create-project-modal textarea::-webkit-input-placeholder,
          .create-project-modal input::-moz-placeholder,
          .create-project-modal textarea::-moz-placeholder,
          .create-project-modal input:-ms-input-placeholder,
          .create-project-modal textarea:-ms-input-placeholder {
            color: #4b5563 !important;
            opacity: 1 !important;
          }
        `}</style>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-[#1f2937]">Create New Project</h3>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-[#6A89A7] hover:text-[#384959] hover:bg-[#BDDDFC] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project Name"
              style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
              className="w-full rounded-xl border-2 border-[#D9EBFF] bg-[#FBFDFF] px-4 py-3 text-sm font-semibold text-[#0f172a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#88BDF2]"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (Optional)"
              rows={4}
              style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
              className="w-full rounded-xl border-2 border-[#D9EBFF] bg-[#FBFDFF] px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#88BDF2] resize-none"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="text-sm text-[#9aa6b2] px-3 py-2 rounded-md hover:bg-[#f3f6f9] transition-colors"
            >
              Cancel
            </button>

            <Button
              onClick={handleCreate}
              disabled={!title.trim() || isSubmitting}
              className="rounded-full px-5 py-2 bg-[#66b7ff] hover:bg-[#4fa7f8] text-[#0f172a]"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
