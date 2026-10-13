"use client";

import React from "react";
import { RoundMatch, PlayerMatchStats } from "@/types/badminton";
import { MatchControls } from "./MatchControls";
import { RoundsDisplay } from "./RoundsDisplay";

interface MatchRoundsViewProps {
  playerCount: number;
  numCourts?: number;
  numMatches: number;
  rounds: RoundMatch[] | null;
  playerStats: PlayerMatchStats[] | null;
  onNumCourtsChange?: (courts: number) => void;
  onNumMatchesChange: (value: number) => void;
  onGenerate: () => void;
  onCopyRounds: () => void;
}

export const MatchRoundsView: React.FC<MatchRoundsViewProps> = ({
  playerCount,
  numCourts = 1,
  numMatches,
  rounds,
  playerStats,
  onNumCourtsChange,
  onNumMatchesChange,
  onGenerate,
  onCopyRounds,
}) => {
  return (
    <div>
      <MatchControls
        playerCount={playerCount}
        numCourts={numCourts}
        numMatches={numMatches}
        onNumCourtsChange={onNumCourtsChange}
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
