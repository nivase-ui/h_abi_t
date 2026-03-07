"use client";

import { format, parse } from "date-fns";
import { Check, Trash2, AlarmClock } from "lucide-react";
import type { Habit } from "../types/habit";
import { ICON_MAP } from "../lib/icons";
import { useHabitStore } from "../store/habitStore";

export default function HabitCard({ habit }: { habit: Habit }) {
  const { toggleComplete, removeHabit } = useHabitStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const isCompleted = habit.completedDates.includes(today);

  const Icon = ICON_MAP[habit.icon] || ICON_MAP.fire;

  const timeDate = parse(habit.time, "HH:mm", new Date());
  const displayTime = format(timeDate, "hh:mm a");

  const handleDelete = () => {
    if (window.confirm(`Delete "${habit.name}"?`)) {
      removeHabit(habit.id);
    }
  };

  return (
    <div
      className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
        isCompleted
          ? "bg-lava/8 border border-lava/20"
          : "bg-surface border border-white/[0.04]"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
          isCompleted ? "bg-lava/20" : "bg-surface-light"
        }`}
      >
        <Icon
          className={`w-5 h-5 transition-colors duration-300 ${
            isCompleted ? "text-lava" : "text-lava-light"
          }`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3
          className={`font-medium text-[15px] leading-tight transition-all duration-300 ${
            isCompleted ? "text-white/50 line-through" : "text-white"
          }`}
        >
          {habit.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs text-gray-500">{displayTime}</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span className="text-xs text-lava/70 font-medium capitalize">
            {habit.frequency || "daily"}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <AlarmClock className="w-3 h-3" />
            {habit.snoozeDuration}m
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-700 hover:text-red-400 hover:bg-white/5 transition-colors"
          aria-label="Delete habit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => toggleComplete(habit.id, today)}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isCompleted
              ? "bg-lava text-white shadow-lg shadow-lava/25"
              : "bg-surface-light text-gray-600 hover:text-lava hover:bg-lava/10"
          }`}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        >
          <Check className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
