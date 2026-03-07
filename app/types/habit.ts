export type FrequencyType = "daily" | "weekly" | "monthly" | "dates";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  time: string; // HH:mm format
  snoozeDuration: number; // minutes
  frequency: FrequencyType;
  weekDays: number[]; // 0-6 (Sun-Sat), used when frequency === "weekly"
  monthDays: number[]; // 1-31, used when frequency === "monthly"
  selectedDates: string[]; // yyyy-MM-dd, used when frequency === "dates"
  createdAt: string;
  completedDates: string[]; // yyyy-MM-dd strings
}
