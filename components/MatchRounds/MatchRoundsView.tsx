"use client";

import React from "react";
import { RoundMatch, PlayerMatchStats } from "@/types/badminton";
import { MatchControls } from "./MatchControls";
import { RoundsDisplay } from "./RoundsDisplay";

interface MatchRoundsViewProps {
  playerCount: number;
  numMatches: number;
  rounds: RoundMatch[] | null;
  playerStats: PlayerMatchStats[] | null;
  onNumMatchesChange: (value: number) => void;
  onGenerate: () => void;
  onCopyRounds: () => void;
}

export const MatchRoundsView: React.FC<MatchRoundsViewProps> = ({
  playerCount,
  numMatches,
  rounds,
  playerStats,
  onNumMatchesChange,
  onGenerate,
  onCopyRounds,
}) => {
  return (
    <div>
      <MatchControls
        playerCount={playerCount}
        numMatches={numMatches}
        onNumMatchesChange={onNumMatchesChange}
        onGenerate={onGenerate}
      />

      {rounds && rounds.length > 0 && playerStats && (
        <RoundsDisplay
          rounds={rounds}
          stats={playerStats}
          onCopyRounds={onCopyRounds}
        />
      )}
    </div>
  );
};
