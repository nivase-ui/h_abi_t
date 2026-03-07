"use client";

import { useState } from "react";
import { X, Clock, AlarmClock, CalendarDays, Minus, Plus } from "lucide-react";
import { format } from "date-fns";
import { ICON_MAP, ICON_OPTIONS } from "../lib/icons";
import { useHabitStore } from "../store/habitStore";
import type { FrequencyType } from "../types/habit";

const FREQ_OPTIONS: { key: FrequencyType; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "dates", label: "Dates" },
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HabitForm({ isOpen, onClose }: HabitFormProps) {
  const addHabit = useHabitStore((s) => s.addHabit);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("fire");
  const [time, setTime] = useState("08:00");
  const [snooze, setSnooze] = useState(10);
  const [frequency, setFrequency] = useState<FrequencyType>("daily");
  const [weekDays, setWeekDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [monthDays, setMonthDays] = useState<number[]>([1]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("");

  const toggleWeekDay = (day: number) =>
    setWeekDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const toggleMonthDay = (day: number) =>
    setMonthDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const addDate = () => {
    if (!dateInput) return;
    const formatted = format(new Date(dateInput + "T00:00:00"), "yyyy-MM-dd");
    if (!selectedDates.includes(formatted)) {
      setSelectedDates((prev) => [...prev, formatted].sort());
    }
    setDateInput("");
  };

  const removeDate = (date: string) =>
    setSelectedDates((prev) => prev.filter((d) => d !== date));

  const resetForm = () => {
    setName("");
    setIcon("fire");
    setTime("08:00");
    setSnooze(10);
    setFrequency("daily");
    setWeekDays([1, 2, 3, 4, 5]);
    setMonthDays([1]);
    setSelectedDates([]);
    setDateInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (snooze < 1) return;

    addHabit({
      name: name.trim(),
      icon,
      time,
      snoozeDuration: snooze,
      frequency,
      weekDays: frequency === "weekly" ? weekDays : [],
      monthDays: frequency === "monthly" ? monthDays : [],
      selectedDates: frequency === "dates" ? selectedDates : [],
    });

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-surface border-t border-white/[0.06] rounded-t-3xl animate-slide-up max-h-[92vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 pt-5 pb-0 shrink-0">
          <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-6" />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">New Habit</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-surface-light flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 pb-10 flex-1 overscroll-contain">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Habit Name */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2.5 block">
                Habit Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Run"
                className="w-full bg-surface-light border border-white/[0.06] rounded-xl px-4 py-3.5 text-white text-[15px] placeholder-gray-600 focus:outline-none focus:border-lava/40 focus:ring-1 focus:ring-lava/20 transition-all"
                autoFocus
                required
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-3 block">
                Choose Icon
              </label>
              <div className="grid grid-cols-7 gap-2">
                {ICON_OPTIONS.map(({ key, label }) => {
                  const IconComp = ICON_MAP[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setIcon(key)}
                      title={label}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${
                        icon === key
                          ? "bg-lava text-white scale-110 shadow-lg shadow-lava/30"
                          : "bg-surface-light text-gray-500 hover:text-lava hover:bg-lava/10"
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Frequency
              </label>
              <div className="grid grid-cols-4 gap-2">
                {FREQ_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFrequency(key)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      frequency === key
                        ? "bg-lava text-white shadow-lg shadow-lava/25"
                        : "bg-surface-light text-gray-500 hover:text-white border border-white/[0.04]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Weekly: Day picker */}
              {frequency === "weekly" && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2.5">Select days</p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {WEEK_DAYS.map((label, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleWeekDay(i)}
                        className={`py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          weekDays.includes(i)
                            ? "bg-lava/20 text-lava border border-lava/30"
                            : "bg-surface-light text-gray-600 border border-white/[0.04]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly: Day-of-month picker */}
              {frequency === "monthly" && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2.5">
                    Select days of month
                  </p>
                  <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleMonthDay(day)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          monthDays.includes(day)
                            ? "bg-lava/20 text-lava border border-lava/30"
                            : "bg-surface-light text-gray-600 border border-white/[0.04]"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates: Date picker */}
              {frequency === "dates" && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2.5">
                    Pick specific dates
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="flex-1 bg-surface-light border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lava/40 focus:ring-1 focus:ring-lava/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={addDate}
                      className="px-4 py-3 bg-lava/15 text-lava rounded-xl text-sm font-medium hover:bg-lava/25 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {selectedDates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedDates.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1.5 bg-surface-light border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-gray-300"
                        >
                          {format(new Date(d + "T00:00:00"), "MMM d, yyyy")}
                          <button
                            type="button"
                            onClick={() => removeDate(d)}
                            className="text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2.5 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Reminder Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-surface-light border border-white/[0.06] rounded-xl px-4 py-3.5 text-white text-[15px] focus:outline-none focus:border-lava/40 focus:ring-1 focus:ring-lava/20 transition-all"
                required
              />
            </div>

            {/* Snooze Duration — Dynamic input */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <AlarmClock className="w-4 h-4" />
                Snooze Duration
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSnooze((s) => Math.max(1, s - 5))}
                  className="w-12 h-12 rounded-xl bg-surface-light border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={snooze}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v >= 1) setSnooze(v);
                      if (e.target.value === "") setSnooze(1);
                    }}
                    className="w-full bg-surface-light border border-white/[0.06] rounded-xl px-4 py-3.5 text-white text-center text-lg font-semibold tabular-nums focus:outline-none focus:border-lava/40 focus:ring-1 focus:ring-lava/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    min
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSnooze((s) => Math.min(999, s + 5))}
                  className="w-12 h-12 rounded-xl bg-surface-light border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-lava hover:bg-lava-dark text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-lava/20 hover:shadow-lava/35 active:scale-[0.98] mt-2"
            >
              Create Habit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
