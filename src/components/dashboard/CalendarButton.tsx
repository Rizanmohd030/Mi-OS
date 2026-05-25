"use client";

import { CalendarDays } from "lucide-react";

type CalendarButtonProps = {
  onClick: () => void;
};

export default function CalendarButton({
  onClick,
}: CalendarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        rounded-2xl border border-white/10
        bg-white/5 p-4
        text-white/70
        transition-all duration-300
        hover:bg-white/10
        hover:text-white
      "
    >
      <CalendarDays size={22} />
    </button>
  );
}