"use client";

import { format } from "date-fns";
import { Flame } from "lucide-react";

export default function Header() {
  const today = new Date();

  return (
    <header className="px-5 pt-14 pb-6">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-9 h-9 rounded-xl bg-lava/15 flex items-center justify-center">
          <Flame className="w-5 h-5 text-lava" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          habi<span className="text-lava">.at</span>
        </h1>
      </div>
      <p className="text-sm text-gray-500 mt-2 ml-0.5">
        {format(today, "EEEE, MMMM d")}
      </p>
    </header>
  );
}
