"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Player,
  SplitSummary,
  RoundMatch,
  PlayerMatchStats,
  TabType,
  SyncStatus,
  BadmintonSessionData,
} from "@/types/badminton";
import { calculateCostSplit, formatSplitSummaryText } from "@/lib/costSplitter";
import { generateFairRounds, getSuggestedMatchCount, formatRoundsText } from "@/lib/fairMatchmaking";
import { saveSessionData, loadSessionData, subscribeToSession } from "@/lib/badmintonStorage";

const INITIAL_PLAYERS: Player[] = [
  { id: "1", name: "heshan", hours: 2 },
  { id: "2", name: "nadil", hours: 2 },
  { id: "3", name: "venusha", hours: 2 },
  { id: "4", name: "sanjula", hours: 2 },
  { id: "5", name: "manuja", hours: 2 },
];

const INITIAL_SESSION: BadmintonSessionData = {
  totalCost: 2000,
  players: INITIAL_PLAYERS,
  numCourts: 1,
  numMatches: 5,
  splitSummary: null,
  rounds: null,
  playerStats: null,
};

export function useBadmintonManager() {
  const [activeTab, setActiveTab] = useState<TabType>("splitter");
  const [totalCost, setTotalCost] = useState<number>(2000);
  const [numCourts, setNumCourts] = useState<number>(1);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [numMatches, setNumMatches] = useState<number>(() =>
    getSuggestedMatchCount(INITIAL_PLAYERS.length, 1)
  );

  const [splitSummary, setSplitSummary] = useState<SplitSummary | null>(null);
  const [rounds, setRounds] = useState<RoundMatch[] | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerMatchStats[] | null>(null);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [savedSession, setSavedSession] = useState<BadmintonSessionData | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Snapshot of last saved state to allow discarding unsaved edits
  const lastSavedSnapshotRef = useRef<BadmintonSessionData | null>(null);
  const prevPlayerCountRef = useRef<number>(INITIAL_PLAYERS.length);

  // Automatically update matches to recommended whenever player count or courts change
  useEffect(() => {
    if (prevPlayerCountRef.current !== players.length) {
      prevPlayerCountRef.current = players.length;
      const recommended = getSuggestedMatchCount(players.length, numCourts);
      setNumMatches(recommended);
    }
  }, [players.length, numCourts]);

  // Determine whether current state has actually changed from saved session
  const hasUnsavedChanges = useMemo(() => {
    const baseline = savedSession ?? INITIAL_SESSION;

    // 1. Total cost check
    if (totalCost !== baseline.totalCost) {
      return true;
    }

    // 2. Number of courts check
    if (numCourts !== (baseline.numCourts || 1)) {
      return true;
    }

    // 3. Custom matches check
    const baselineMatches =
      baseline.numMatches ?? getSuggestedMatchCount(baseline.players?.length || 5, baseline.numCourts || 1);
    const recommendedMatches = getSuggestedMatchCount(players.length, numCourts);
    if (numMatches !== baselineMatches && numMatches !== recommendedMatches) {
      return true;
    }

    // 4. Players check
    const baselinePlayers = baseline.players || [];
    if (players.length !== baselinePlayers.length) {
      return true;
    }

    for (let i = 0; i < players.length; i++) {
      const cp = players[i];
      const bp = baselinePlayers[i];
      if (!bp) return true;
      if (cp.id !== bp.id) return true;
      if (cp.name.trim() !== bp.name.trim()) return true;
      if (Number(cp.hours) !== Number(bp.hours)) return true;
    }

    // 5. Rounds check
    const baselineRounds = baseline.rounds || [];
    const currentRounds = rounds || [];
    if (currentRounds.length !== baselineRounds.length) {
      return true;
    }

    if (currentRounds.length > 0 && baselineRounds.length > 0) {
      const roundsDifferent = currentRounds.some((r, idx) => {
        const br = baselineRounds[idx];
        if (!br) return true;
        return (
          r.team1.join(",") !== br.team1.join(",") ||
          r.team2.join(",") !== br.team2.join(",")
        );
      });
      if (roundsDifferent) return true;
    }

    return false;
  }, [totalCost, numCourts, players, numMatches, rounds, savedSession]);

  // Show transient feedback notifications
  const notify = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 3000);
  }, []);

  // 1. Initial Load from Firebase / localStorage on mount
  useEffect(() => {
    let isMounted = true;

    loadSessionData()
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          lastSavedSnapshotRef.current = INITIAL_SESSION;
          setSavedSession(INITIAL_SESSION);
          setSyncStatus("idle");
          return;
        }

        lastSavedSnapshotRef.current = data;
        setSavedSession(data);

        if (Array.isArray(data.players) && data.players.length > 0) {
          setPlayers(data.players);
          prevPlayerCountRef.current = data.players.length;
          const loadedCourts = typeof data.numCourts === "number" && data.numCourts >= 1 ? data.numCourts : 1;
          setNumCourts(loadedCourts);
          const recommended = getSuggestedMatchCount(data.players.length, loadedCourts);
          setNumMatches(typeof data.numMatches === "number" ? data.numMatches : recommended);
        }
        if (typeof data.numCourts === "number" && data.numCourts >= 1) {
          setNumCourts(data.numCourts);
        }
        if (typeof data.totalCost === "number" && data.totalCost > 0) {
          setTotalCost(data.totalCost);
        }
        if (data.splitSummary) {
          setSplitSummary(data.splitSummary);
        }
        if (Array.isArray(data.rounds)) {
          setRounds(data.rounds);
        }
        if (Array.isArray(data.playerStats)) {
          setPlayerStats(data.playerStats);
        }
        if (data.updatedAt) {
          setLastSavedTime(data.updatedAt);
        }

        setSyncStatus("saved");
      })
      .catch((err) => {
        console.warn("Could not load initial session:", err);
        if (isMounted) {
          lastSavedSnapshotRef.current = INITIAL_SESSION;
          setSavedSession(INITIAL_SESSION);
          setSyncStatus("idle");
        }
      });

    // Realtime listener for remote changes
    const unsubscribe = subscribeToSession((cloudData) => {
      if (!isMounted || !cloudData) return;
      if (cloudData.updatedAt) {
        setLastSavedTime(cloudData.updatedAt);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Browser navigation warning when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Explicit Save to Firebase (Called only on user confirmation / button click)
  const saveSession = useCallback(async () => {
    setSyncStatus("saving");

    const payload: BadmintonSessionData = {
      totalCost,
      players,
      numCourts,
      numMatches,
      splitSummary,
      rounds,
      playerStats,
      updatedAt: new Date().toISOString(),
    };

    const res = await saveSessionData(payload);
    if (res.success) {
      lastSavedSnapshotRef.current = payload;
      setSavedSession(payload);
      setSyncStatus("saved");
      setLastSavedTime(new Date().toISOString());
      notify("☁️ Saved to Firebase!");
    } else {
      lastSavedSnapshotRef.current = payload;
      setSavedSession(payload);
      setSyncStatus("error");
      if (res.error?.toLowerCase().includes("permission")) {
        notify("Saved locally (Firestore rules permission denied)");
      } else {
        notify("Saved locally (cloud offline)");
      }
    }
  }, [totalCost, players, numCourts, numMatches, splitSummary, rounds, playerStats, notify]);

  // Discard unsaved changes and revert to last saved state
  const discardChanges = useCallback(() => {
    const snapshot = savedSession || lastSavedSnapshotRef.current || INITIAL_SESSION;
    const restoredPlayers = snapshot.players || INITIAL_PLAYERS;
    const restoredCourts = snapshot.numCourts || 1;
    setPlayers(restoredPlayers);
    prevPlayerCountRef.current = restoredPlayers.length;
    setNumCourts(restoredCourts);
    setTotalCost(snapshot.totalCost || 2000);
    setNumMatches(snapshot.numMatches ?? getSuggestedMatchCount(restoredPlayers.length, restoredCourts));
    setSplitSummary(snapshot.splitSummary || null);
    setRounds(snapshot.rounds || null);
    setPlayerStats(snapshot.playerStats || null);
    setSyncStatus("saved");
    notify("Reverted to last saved session");
  }, [savedSession, notify]);

  // Change courts: updates court count, recommended matches, and scales totalCost proportionally
  const handleCourtsChange = useCallback((courts: number) => {
    const validCourts = Math.max(1, courts);
    setNumCourts(validCourts);

    const recommended = getSuggestedMatchCount(players.length, validCourts);
    setNumMatches(recommended);

    // Adjust totalCost proportionally to courts so session hours remain consistent
    const prevRate = numCourts * 1000;
    const duration = totalCost > 0 && prevRate > 0 ? totalCost / prevRate : 2;
    const newCost = Math.round(duration * validCourts * 1000);
    setTotalCost(newCost);

    setSplitSummary((curr) => (curr ? calculateCostSplit(players, newCost) : null));
  }, [players, numCourts, totalCost]);

  // Updates Total Court Cost (where 1,000 LKR = 1 hour per court) and adjusts each player's play time
  const handleCostChange = useCallback((newCost: number) => {
    setTotalCost(newCost);

    const minCost = 500 * numCourts;
    if (newCost >= minCost) {
      const courtRatePerHour = numCourts * 1000;
      const newCourtHours = Math.max(0.5, Math.round((newCost / courtRatePerHour) * 2) / 2);

      setPlayers((prevPlayers) => {
        const updatedPlayers = prevPlayers.map((player) => ({
          ...player,
          hours: newCourtHours,
        }));

        // If split is already calculated, keep the results updated
        setSplitSummary((currSummary) => {
          if (!currSummary) return null;
          return calculateCostSplit(updatedPlayers, newCost);
        });

        return updatedPlayers;
      });
    }
  }, [numCourts]);

  const addPlayer = (name = "", hours?: number) => {
    const courtRatePerHour = numCourts * 1000;
    const currentCourtHours = Math.max(0.5, Math.round(((totalCost || 2000) / courtRatePerHour) * 2) / 2);
    const playerHours = typeof hours === "number" && hours > 0 ? hours : currentCourtHours;
    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newPlayerName = name.trim() || `Player ${players.length + 1}`;
    setPlayers((prev) => {
      const updated = [...prev, { id: newId, name: newPlayerName, hours: playerHours }];
      setSplitSummary((curr) => (curr ? calculateCostSplit(updated, totalCost) : null));
      return updated;
    });
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers((prev) => {
      const updated = prev.map((player) =>
        player.id === id ? { ...player, ...updates } : player
      );
      setSplitSummary((curr) => (curr ? calculateCostSplit(updated, totalCost) : null));
      return updated;
    });
  };

  const removePlayer = (id: string) => {
    if (players.length <= 1) {
      notify("You need at least one player.");
      return;
    }
    setPlayers((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      setSplitSummary((curr) => (curr ? calculateCostSplit(updated, totalCost) : null));
      return updated;
    });
  };

  const resetToDefault = () => {
    setPlayers(INITIAL_PLAYERS);
    prevPlayerCountRef.current = INITIAL_PLAYERS.length;
    setNumCourts(1);
    setTotalCost(2000);
    setSplitSummary(null);
    setRounds(null);
    setPlayerStats(null);
    setNumMatches(getSuggestedMatchCount(INITIAL_PLAYERS.length, 1));
    notify("Reset fields");
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

    if (numMatches < 1) {
      notify("Please enter at least 1 match.");
      return;
    }

    const { rounds: generatedRounds, stats } = generateFairRounds(
      validPlayers,
      numMatches,
      numCourts
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
    setTotalCost: handleCostChange,
    numCourts,
    setNumCourts: handleCourtsChange,
    players,
    addPlayer,
    updatePlayer,
    removePlayer,
    numMatches,
    setNumMatches: (val: number) => {
      setNumMatches(val);
    },
    splitSummary,
    rounds,
    playerStats,
    calculateSplit: handleCalculateSplit,
    generateMatches: handleGenerateMatches,
    resetToDefault,
    copySplitText,
    copyRoundsText,
    saveSession,
    discardChanges,
    hasUnsavedChanges,
    syncStatus,
    lastSavedTime,
    notification,
  };
}
