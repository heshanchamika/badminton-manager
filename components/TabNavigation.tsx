"use client";

import React from "react";
import { TabType } from "@/types/badminton";
import { Calculator, Shuffle } from "lucide-react";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  playerCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  playerCount,
}) => {
  return (
    <div className="relative flex p-1.5 bg-slate-100 rounded-xl mb-6 border border-slate-200/80">
      <button
        onClick={() => onTabChange("splitter")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
          activeTab === "splitter"
            ? "bg-white text-blue-600 shadow-sm shadow-slate-200 border border-slate-200/50"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
        }`}
      >
        <Calculator className="w-4 h-4" />
        <span>Cost Splitter</span>
      </button>

      <button
        onClick={() => onTabChange("rounds")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
          activeTab === "rounds"
            ? "bg-white text-emerald-600 shadow-sm shadow-slate-200 border border-slate-200/50"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
        }`}
      >
        <Shuffle className="w-4 h-4" />
        <span>Match Rounds</span>
        <span
          className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === "rounds"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {playerCount}
        </span>
      </button>
    </div>
  );
};
