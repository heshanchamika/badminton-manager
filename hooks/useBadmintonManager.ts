"use client";

import { useState, useCallback } from "react";
import { Player, SplitSummary, RoundMatch, PlayerMatchStats, TabType } from "@/types/badminton";
import { calculateCostSplit, formatSplitSummaryText } from "@/lib/costSplitter";
import { generateFairRounds, getSuggestedMatchCount, formatRoundsText } from "@/lib/fairMatchmaking";

const INITIAL_PLAYERS: Player[] = [
  { id: "1", name: "heshan", hours: 2 },
  { id: "2", name: "nadil", hours: 2 },
  { id: "3", name: "venusha", hours: 2 },
  { id: "4", name: "sanjula", hours: 2 },
  { id: "5", name: "manuja", hours: 2 },
];

export function useBadmintonManager() {
  const [activeTab, setActiveTab] = useState<TabType>("splitter");
  const [totalCost, setTotalCost] = useState<number>(2000);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [customMatches, setCustomMatches] = useState<number | null>(null);

  const [splitSummary, setSplitSummary] = useState<SplitSummary | null>(null);
  const [rounds, setRounds] = useState<RoundMatch[] | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerMatchStats[] | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Compute effective match count: user preference or smart suggestion based on player count
  const effectiveNumMatches = customMatches ?? getSuggestedMatchCount(players.length);

  // Show transient feedback notifications
  const notify = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 3000);
  }, []);

  const addPlayer = (name = "", hours = 2) => {
    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newPlayerName = name.trim() || `Player ${players.length + 1}`;
    setPlayers((prev) => [...prev, { id: newId, name: newPlayerName, hours }]);
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((player) => (player.id === id ? { ...player, ...updates } : player))
    );
  };

  const removePlayer = (id: string) => {
    if (players.length <= 1) {
      notify("You need at least one player.");
      return;
    }
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const resetToDefault = () => {
    setPlayers(INITIAL_PLAYERS);
    setTotalCost(2000);
    setSplitSummary(null);
    setRounds(null);
    setPlayerStats(null);
    setCustomMatches(null);
    notify("Reset to initial defaults");
  };

  const handleCalculateSplit = () => {
    if (totalCost <= 0) {
      notify("Please enter a valid court cost.");
      return;
    }
    const result = calculateCostSplit(players, totalCost);
    if (!result) {
      notify("Please ensure player hours are greater than 0.");
      return;
    }
    setSplitSummary(result);
  };

  const handleGenerateMatches = () => {
    const validPlayers = players
      .map((p) => p.name.trim())
      .filter((n) => n.length > 0);

    if (validPlayers.length < 4) {
      notify("You need at least 4 players to generate doubles matches.");
      return;
    }

    if (effectiveNumMatches < 1) {
      notify("Please enter at least 1 match.");
      return;
    }

    const { rounds: generatedRounds, stats } = generateFairRounds(
      validPlayers,
      effectiveNumMatches
    );
    setRounds(generatedRounds);
    setPlayerStats(stats);
  };

  const copySplitText = async () => {
    if (!splitSummary) return;
    const text = formatSplitSummaryText(splitSummary);
    try {
      await navigator.clipboard.writeText(text);
      notify("📋 Cost breakdown copied to clipboard!");
    } catch {
      notify("Failed to copy to clipboard.");
    }
  };

  const copyRoundsText = async () => {
    if (!rounds || !playerStats) return;
    const text = formatRoundsText(rounds, playerStats);
    try {
      await navigator.clipboard.writeText(text);
      notify("📋 Match schedule copied to clipboard!");
    } catch {
      notify("Failed to copy to clipboard.");
    }
  };

  return {
    activeTab,
    setActiveTab,
    totalCost,
    setTotalCost,
    players,
    addPlayer,
    updatePlayer,
    removePlayer,
    numMatches: effectiveNumMatches,
    setNumMatches: (val: number) => {
      setCustomMatches(val);
    },
    splitSummary,
    rounds,
    playerStats,
    calculateSplit: handleCalculateSplit,
    generateMatches: handleGenerateMatches,
    resetToDefault,
    copySplitText,
    copyRoundsText,
    notification,
  };
}
