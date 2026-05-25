"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: string; // emoji or mood name
}

interface MoodCalendarProps {
  entries?: MoodEntry[];
  onAddMood?: (date: string, mood: string) => void;
}

const MOODS = ["😊", "😔", "😠", "😴", "🤔", "😍", "😎", "🥳"];

export default function MoodCalendar({ entries = [], onAddMood }: MoodCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create mood lookup
  const moodMap = entries.reduce((acc, entry) => {
    acc[entry.date] = entry.mood;
    return acc;
  }, {} as Record<string, string>);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
  };

  const handleMoodSelect = (mood: string) => {
    if (selectedDate && onAddMood) {
      onAddMood(selectedDate, mood);
      setSelectedDate(null);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysArray = [];
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  const moodedDays = Object.keys(moodMap).filter(date => {
    const [y, m, d] = date.split("-");
    return parseInt(y) === year && parseInt(m) === month + 1;
  }).length;

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0E121A] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-light text-slate-200">
            {moodedDays}/{daysInMonth}
          </h3>
          <p className="text-xs font-light text-slate-500 uppercase tracking-wider">
            Moods logged this month
          </p>
        </div>
        
        <button
          onClick={handleNextMonth}
          className="
            flex items-center justify-center h-10 w-10 rounded-full
            hover:bg-white/10 transition-all text-slate-400 hover:text-slate-300
          "
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-white/10 rounded transition-all text-slate-400 hover:text-slate-300"
        >
          <ChevronLeft size={18} />
        </button>
        
        <h4 className="text-sm font-light text-slate-300">
          {monthNames[month]} {year}
        </h4>
        
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-white/10 rounded transition-all text-slate-400 hover:text-slate-300"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-light text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const mood = moodMap[dateStr];
          const isSelected = selectedDate === dateStr;

          return (
            <motion.button
              key={day}
              onClick={() => handleDateClick(day)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                aspect-square rounded-full flex items-center justify-center text-lg
                transition-all duration-200
                ${isSelected 
                  ? 'ring-2 ring-slate-400' 
                  : 'border border-slate-700/30'
                }
                ${mood 
                  ? 'bg-slate-700/50' 
                  : 'bg-slate-800/30 hover:bg-slate-700/30'
                }
              `}
            >
              {mood ? <span>{mood}</span> : <span className="text-xs text-slate-600">{day}</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Mood Selector */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/[0.04] pt-4"
        >
          <p className="text-xs font-light text-slate-500 uppercase tracking-wider mb-3">
            Select a mood for {selectedDate}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className="
                  aspect-square text-2xl rounded-lg
                  hover:bg-white/10 transition-all hover:scale-110
                "
              >
                {mood}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
