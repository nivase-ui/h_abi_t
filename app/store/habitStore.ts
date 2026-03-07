import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Habit, FrequencyType } from "../types/habit";

interface HabitState {
  habits: Habit[];
  addHabit: (data: {
    name: string;
    icon: string;
    time: string;
    snoozeDuration: number;
    frequency: FrequencyType;
    weekDays: number[];
    monthDays: number[];
    selectedDates: string[];
  }) => void;
  removeHabit: (id: string) => void;
  toggleComplete: (id: string, date: string) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],

      addHabit: (data) =>
        set((state) => ({
          habits: [
            {
              id: uuidv4(),
              name: data.name,
              icon: data.icon,
              time: data.time,
              snoozeDuration: data.snoozeDuration,
              frequency: data.frequency,
              weekDays: data.weekDays,
              monthDays: data.monthDays,
              selectedDates: data.selectedDates,
              createdAt: new Date().toISOString(),
              completedDates: [],
            },
            ...state.habits,
          ],
        })),

      removeHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      toggleComplete: (id, date) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            const isCompleted = h.completedDates.includes(date);
            return {
              ...h,
              completedDates: isCompleted
                ? h.completedDates.filter((d) => d !== date)
                : [...h.completedDates, date],
            };
          }),
        })),
    }),
    { name: "habiat-habits" }
  )
);
