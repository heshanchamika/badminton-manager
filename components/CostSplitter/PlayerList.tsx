"use client";

import React from "react";
import { Player } from "@/types/badminton";
import { PlayerRow } from "./PlayerRow";
import { UserPlus, Clock } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  onAddPlayer: (name?: string, hours?: number) => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onRemovePlayer: (id: string) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
}) => {
  const totalPlayerHours = players.reduce((sum, p) => sum + (Number(p.hours) || 0), 0);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-700 tracking-wide uppercase">
            Players ({players.length})
          </h2>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-slate-400" />
            {totalPlayerHours.toFixed(1)} hrs total
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddPlayer("", 2)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all border border-blue-200/60 shadow-xs cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Player</span>
        </button>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {players.map((player, index) => (
          <PlayerRow
            key={player.id}
            player={player}
            index={index}
            onUpdate={onUpdatePlayer}
            onRemove={onRemovePlayer}
            canRemove={players.length > 1}
          />
        ))}
      </div>
    </div>
  );
};
