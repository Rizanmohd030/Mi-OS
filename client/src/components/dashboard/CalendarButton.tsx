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
        rounded-2xl border-2 border-[#88BDF2]
        bg-[#BDDDFC] p-4
        text-[#6A89A7]
        transition-all duration-300
        hover:bg-[#88BDF2]
        hover:text-white
      "
    >
      <CalendarDays size={22} />
    </button>
  );
}