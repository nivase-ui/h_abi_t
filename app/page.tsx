"use client";

import { useState, useEffect } from "react";
import { Plus, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useHabitStore } from "./store/habitStore";
import Header from "./components/Header";
import HabitCard from "./components/HabitCard";
import HabitForm from "./components/HabitForm";
import NotificationBanner from "./components/NotificationBanner";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const habits = useHabitStore((s) => s.habits);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const today = format(new Date(), "yyyy-MM-dd");
  const completedCount = habits.filter((h) =>
    h.completedDates.includes(today)
  ).length;

  if (!mounted) {
    return (
      <main className="min-h-screen">
        <div className="px-5 pt-14 pb-6 space-y-3">
          <div className="h-9 w-28 bg-surface rounded-xl animate-pulse" />
          <div className="h-4 w-44 bg-surface rounded-lg animate-pulse" />
        </div>
        <div className="px-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-surface rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28">
      <Header />

      {/* Notification Permission Banner */}
      <NotificationBanner />

      {/* Progress Bar */}
      {habits.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-lava rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(completedCount / habits.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-gray-500 tabular-nums font-medium">
              {completedCount}/{habits.length}
            </span>
          </div>
        </div>
      )}

      {/* Habit List */}
      <div className="px-5 space-y-3">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-28 text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-lava" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              No habits yet
            </h2>
            <p className="text-sm text-gray-500 max-w-[260px] leading-relaxed">
              Start building better habits.
              <br />
              Tap the button below to create your first one.
            </p>
          </div>
        ) : (
          habits.map((habit) => <HabitCard key={habit.id} habit={habit} />)
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-7 right-6 w-14 h-14 bg-lava hover:bg-lava-dark rounded-2xl flex items-center justify-center shadow-xl shadow-lava/30 transition-all duration-200 active:scale-90 z-40"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Create Habit Form */}
      <HabitForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </main>
  );
}
