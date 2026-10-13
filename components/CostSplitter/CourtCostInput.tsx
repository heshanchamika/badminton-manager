"use client";

import React from "react";
import { Banknote } from "lucide-react";

interface CourtCostInputProps {
  totalCost: number;
  numCourts?: number;
  onCourtsChange?: (courts: number) => void;
  onChange: (value: number) => void;
}

export const CourtCostInput: React.FC<CourtCostInputProps> = ({
  totalCost,
  numCourts = 1,
  onCourtsChange,
  onChange,
}) => {
  const courtRate = numCourts * 1000;
  const courtDuration = totalCost && courtRate > 0 ? (totalCost / courtRate).toFixed(1) : "0";

  // Dynamic presets based on number of active courts
  const presets = numCourts === 1
    ? [1000, 1500, 2000, 2500, 3000, 4000]
    : [2000, 3000, 4000, 5000, 6000, 8000];

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="court-cost-input"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
        >
          <Banknote className="w-4 h-4 text-emerald-600" />
          Total Court Cost
        </label>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            {courtDuration} hrs court time {numCourts > 1 ? `(${numCourts} courts)` : ""}
          </span>
          <span className="text-xs font-semibold text-slate-400">LKR</span>
        </div>
      </div>

      {/* Courts Toggle Selector if onCourtsChange is provided */}
      {onCourtsChange && (
        <div className="flex items-center justify-between py-1.5 px-2 mb-3 bg-white border border-slate-200/60 rounded-lg">
          <span className="text-xs font-semibold text-slate-600">Active Courts:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
            <button
              type="button"
              onClick={() => onCourtsChange(1)}
              className={`px-2.5 py-0.5 text-xs font-bold rounded transition-all cursor-pointer ${
                numCourts === 1
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              1 Court
            </button>
            <button
              type="button"
              onClick={() => onCourtsChange(2)}
              className={`px-2.5 py-0.5 text-xs font-bold rounded transition-all cursor-pointer ${
                numCourts === 2
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              2 Courts
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
          Rs.
        </span>
        <input
          id="court-cost-input"
          type="number"
          min="0"
          step="100"
          value={totalCost || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder="e.g. 2000"
          className="w-full bg-white border border-slate-200 rounded-lg pl-12 pr-4 py-2.5 text-lg font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        <span className="text-[11px] text-slate-400 mr-1 font-medium">Quick presets:</span>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`px-2 py-0.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
              totalCost === preset
                ? "bg-blue-50 text-blue-700 border-blue-300 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {preset.toLocaleString()} ({(preset / courtRate).toFixed(1).replace(".0", "")}h)
          </button>
        ))}
      </div>
    </div>
  );
};
