"use client";

import React from "react";
import { Player } from "@/types/badminton";
import { Trash2, Plus, Minus } from "lucide-react";

interface PlayerRowProps {
  player: Player;
  index: number;
  onUpdate: (id: string, updates: Partial<Player>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-purple-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-red-600",
];

export const PlayerRow: React.FC<PlayerRowProps> = ({
  player,
  index,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initial = player.name.trim() ? player.name.trim()[0].toUpperCase() : `${index + 1}`;

  const adjustHours = (delta: number) => {
    const next = Math.max(0.5, Math.round(((player.hours || 0) + delta) * 2) / 2);
    onUpdate(player.id, { hours: next });
  };

  return (
    <div className="group flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 transition-all">
      {/* Player Initials Avatar */}
      <div
        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs select-none`}
      >
        {initial}
      </div>

      {/* Name Input */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={player.name}
          onChange={(e) => onUpdate(player.id, { name: e.target.value })}
          placeholder={`Player ${index + 1}`}
          className="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize transition-all"
        />
      </div>

      {/* Hours Stepper */}
      <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-lg p-0.5 shrink-0">
        <button
          type="button"
          onClick={() => adjustHours(-0.5)}
          title="Decrease by 0.5 hr"
          disabled={player.hours <= 0.5}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
        >
          <Minus className="w-3 h-3" />
        </button>

        <div className="flex items-center px-1">
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={player.hours}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onUpdate(player.id, { hours: isNaN(val) ? 0 : val });
            }}
            className="w-9 text-center font-bold text-xs text-slate-800 focus:outline-none"
          />
          <span className="text-[11px] font-medium text-slate-400 select-none">h</span>
        </div>

        <button
          type="button"
          onClick={() => adjustHours(0.5)}
          title="Increase by 0.5 hr"
          className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={() => onRemove(player.id)}
        disabled={!canRemove}
        title={canRemove ? "Remove player" : "Cannot remove only player"}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-20 disabled:hover:text-slate-400 disabled:hover:bg-transparent shrink-0 cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
