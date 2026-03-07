import {
  Dumbbell,
  BookOpen,
  Droplets,
  Moon,
  Apple,
  Brain,
  PenLine,
  Heart,
  Music,
  Code,
  Pill,
  Footprints,
  Flame,
  Coffee,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  fire: Flame,
  dumbbell: Dumbbell,
  book: BookOpen,
  water: Droplets,
  sleep: Moon,
  nutrition: Apple,
  meditate: Brain,
  write: PenLine,
  health: Heart,
  music: Music,
  code: Code,
  medicine: Pill,
  walk: Footprints,
  coffee: Coffee,
};

export const ICON_OPTIONS = Object.entries(ICON_MAP).map(([key]) => ({
  key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));
