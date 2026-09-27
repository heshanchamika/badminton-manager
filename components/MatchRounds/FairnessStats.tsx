"use client";

import React from "react";
import { PlayerMatchStats } from "@/types/badminton";
import { BarChart3 } from "lucide-react";

interface FairnessStatsProps {
  stats: PlayerMatchStats[];
}

export const FairnessStats: React.FC<FairnessStatsProps> = ({ stats }) => {
  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-4">
      <div className="flex items-center gap-1.5 mb-2.5">
        <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Playtime Distribution
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.name}
            className="bg-white border border-slate-200/60 rounded-lg p-2 text-xs flex flex-col justify-between shadow-2xs"
          >
            <span className="font-bold text-slate-800 capitalize truncate">{s.name}</span>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span className="text-emerald-700 font-semibold">{s.matchesPlayed} games</span>
              <span className="text-slate-400">({s.restCount} rests)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
