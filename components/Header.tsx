"use client";

import React from "react";
import { Users, RotateCcw } from "lucide-react";

interface HeaderProps {
  playerCount: number;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ playerCount, onReset }) => {
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-2xl select-none">
            🏸
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Badminton Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Fair Court Splits & Smart Doubles Rotation
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          title="Reset to defaults"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/60 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/60">
          <Users className="w-3 h-3" />
          {playerCount} Players active
        </span>
        <span className="text-slate-300">•</span>
        <span>Auto-adjusting doubles matchmaking</span>
      </div>
    </header>
  );
};
