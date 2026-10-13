"use client";

import React from "react";
import { Shuffle, Sparkles, HelpCircle } from "lucide-react";
import { getSuggestedMatchCount } from "@/lib/fairMatchmaking";

interface MatchControlsProps {
  playerCount: number;
  numCourts?: number;
  numMatches: number;
  onNumCourtsChange?: (courts: number) => void;
  onNumMatchesChange: (value: number) => void;
  onGenerate: () => void;
}

export const MatchControls: React.FC<MatchControlsProps> = ({
  playerCount,
  numCourts = 1,
  numMatches,
  onNumCourtsChange,
  onNumMatchesChange,
  onGenerate,
}) => {
  const suggested = getSuggestedMatchCount(playerCount, numCourts);
  const defaultOptions = [3, 4, 5, 6, 8, 10, 12];
  const quickOptions = Array.from(new Set([suggested, ...defaultOptions]))
    .filter((n) => n > 0 && n <= 24)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-4 mb-6">
      {/* Explanation Banner */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-xs text-emerald-900 leading-relaxed">
          <strong>Fair Doubles Rotation:</strong> Automatically prioritizes resting those who have
          played the most games, and pairs different doubles partners every round across all active courts.
        </p>
      </div>

      {/* Courts Selection Widget */}
      {onNumCourtsChange && (
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Active Courts
              </label>
              <p className="text-[11px] text-slate-500 font-medium">
                {numCourts === 1
                  ? "1 Court • 4 players playing per round"
                  : `${numCourts} Courts • ${numCourts * 4} players playing per round`}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => onNumCourtsChange(1)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  numCourts === 1
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                1 Court
              </button>
              <button
                type="button"
                onClick={() => onNumCourtsChange(2)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  numCourts === 2
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                2 Courts
              </button>
              <button
                type="button"
                onClick={() => onNumCourtsChange(3)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  numCourts === 3
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                3
              </button>
            </div>
          </div>

          {playerCount >= 8 && numCourts === 1 && (
            <div className="mt-2.5 text-[11px] text-emerald-800 bg-emerald-100/70 border border-emerald-200/60 p-2 rounded-lg flex items-center justify-between">
              <span>💡 <strong>{playerCount} players active!</strong> You have enough players to run 2 courts.</span>
              <button
                type="button"
                onClick={() => onNumCourtsChange(2)}
                className="font-bold underline text-emerald-900 hover:text-emerald-950 cursor-pointer ml-1.5"
              >
                Switch to 2 Courts
              </button>
            </div>
          )}

          {playerCount < numCourts * 4 && (
            <p className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              {numCourts} courts requires at least {numCourts * 4} active players for full doubles (currently {playerCount}).
            </p>
          )}
        </div>
      )}

      {/* Matches Input & Quick Select */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="matches-count-input"
            className="text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            Rounds to Generate
          </label>
          <button
            type="button"
            onClick={() => onNumMatchesChange(suggested)}
            title="Click to apply recommended match count"
            className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
          >
            <span>Recommended:</span>
            <strong className="text-emerald-900">{suggested}</strong>
            {numMatches === suggested && (
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded font-bold">
                Auto
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="matches-count-input"
            type="number"
            min="1"
            max="30"
            value={numMatches || ""}
            onChange={(e) => onNumMatchesChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 bg-white border border-slate-200 rounded-lg py-2 text-center text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {quickOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onNumMatchesChange(opt)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  numMatches === opt
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {opt}
                {opt === suggested && (
                  <span
                    className={`ml-1 text-[10px] ${
                      numMatches === opt ? "text-emerald-100" : "text-emerald-600 font-bold"
                    }`}
                  >
                    ★
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {playerCount < 4 && (
          <p className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Doubles requires at least 4 active players (currently {playerCount}).
          </p>
        )}
      </div>

      {/* Generate Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={playerCount < 4}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold py-3.5 px-4 rounded-xl text-base transition-all shadow-md shadow-emerald-500/20 active:scale-[0.99] cursor-pointer"
      >
        <Shuffle className="w-5 h-5" />
        <span>Generate Matches</span>
      </button>
    </div>
  );
};
