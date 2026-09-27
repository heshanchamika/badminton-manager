"use client";

import React from "react";
import { Shuffle, Sparkles, HelpCircle } from "lucide-react";
import { getSuggestedMatchCount } from "@/lib/fairMatchmaking";

interface MatchControlsProps {
  playerCount: number;
  numMatches: number;
  onNumMatchesChange: (value: number) => void;
  onGenerate: () => void;
}

export const MatchControls: React.FC<MatchControlsProps> = ({
  playerCount,
  numMatches,
  onNumMatchesChange,
  onGenerate,
}) => {
  const suggested = getSuggestedMatchCount(playerCount);
  const quickOptions = [3, 4, 5, 6, 8];

  return (
    <div className="space-y-4 mb-6">
      {/* Explanation Banner */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-xs text-emerald-900 leading-relaxed">
          <strong>Fair Doubles Rotation:</strong> Automatically prioritizes resting those who have
          played the most games, and pairs different doubles partners every round.
        </p>
      </div>

      {/* Matches Input & Quick Select */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="matches-count-input"
            className="text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            Matches to Generate
          </label>
          <span className="text-xs text-slate-500 font-medium">
            Suggested: <strong className="text-emerald-700">{suggested}</strong>
          </span>
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
