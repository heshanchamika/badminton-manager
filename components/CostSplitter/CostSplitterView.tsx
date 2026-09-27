"use client";

import React from "react";
import { Player, SplitSummary } from "@/types/badminton";
import { CourtCostInput } from "./CourtCostInput";
import { PlayerList } from "./PlayerList";
import { SplitResultsCard } from "./SplitResultsCard";
import { Calculator } from "lucide-react";

interface CostSplitterViewProps {
  totalCost: number;
  players: Player[];
  splitSummary: SplitSummary | null;
  onCostChange: (cost: number) => void;
  onAddPlayer: (name?: string, hours?: number) => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onRemovePlayer: (id: string) => void;
  onCalculate: () => void;
  onCopySplit: () => void;
}

export const CostSplitterView: React.FC<CostSplitterViewProps> = ({
  totalCost,
  players,
  splitSummary,
  onCostChange,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
  onCalculate,
  onCopySplit,
}) => {
  return (
    <div>
      <CourtCostInput totalCost={totalCost} onChange={onCostChange} />

      <PlayerList
        players={players}
        onAddPlayer={onAddPlayer}
        onUpdatePlayer={onUpdatePlayer}
        onRemovePlayer={onRemovePlayer}
      />

      <button
        type="button"
        onClick={onCalculate}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-base transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer"
      >
        <Calculator className="w-5 h-5" />
        <span>Calculate Split</span>
      </button>

      {splitSummary && <SplitResultsCard summary={splitSummary} onCopy={onCopySplit} />}
    </div>
  );
};
