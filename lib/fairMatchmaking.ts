import { RoundMatch, PlayerMatchStats, CourtGame } from "@/types/badminton";

/**
 * Calculates a sensible default number of matches/rounds based on player count and courts
 */
export function getSuggestedMatchCount(playerCount: number, numCourts: number = 1): number {
  if (numCourts <= 1) {
    if (playerCount <= 4) return 3;
    if (playerCount === 5) return 5;
    return Math.floor(playerCount * 1.5);
  }

  // Multi-court (e.g. 2 courts = 8 players playing at once)
  if (playerCount <= 8) return 5;
  if (playerCount <= 10) return 6;
  return Math.max(5, Math.ceil((playerCount * 1.2) / numCourts));
}

/**
 * Generates fair doubles match rotations across 1 or more courts:
 * 1. Prioritizes resting players who have played the most matches
 * 2. Distributes players evenly across courts
 * 3. Minimizes duplicate doubles partnerships on each court
 */
export function generateFairRounds(
  playerNames: string[],
  numRounds: number,
  numCourts: number = 1
): { rounds: RoundMatch[]; stats: PlayerMatchStats[] } {
  const cleanPlayers = playerNames.map((p) => p.trim()).filter((p) => p.length > 0);

  if (cleanPlayers.length < 4 || numRounds < 1) {
    return { rounds: [], stats: [] };
  }

  // Effective courts cannot exceed how many full 4-player doubles games we can field
  const maxPossibleCourts = Math.max(1, Math.floor(cleanPlayers.length / 4));
  const effectiveCourts = Math.max(1, Math.min(numCourts, maxPossibleCourts));
  const playersPerRound = effectiveCourts * 4;

  // Track play count per player
  const playCounts: Record<string, number> = {};
  const restCounts: Record<string, number> = {};
  cleanPlayers.forEach((p) => {
    playCounts[p] = 0;
    restCounts[p] = 0;
  });

  // Track partnership counts: "PlayerA|PlayerB"
  const partnerCounts: Record<string, number> = {};
  const getPartnerKey = (p1: string, p2: string): string => {
    return [p1, p2].sort().join("|");
  };

  const rounds: RoundMatch[] = [];

  for (let i = 0; i < numRounds; i++) {
    // 1. Sort players to pick active players with least play counts
    // First shuffle to randomly break ties
    const sortedPlayers = [...cleanPlayers]
      .sort(() => 0.5 - Math.random())
      .sort((a, b) => playCounts[a] - playCounts[b]);

    const activePlayers = sortedPlayers.slice(0, playersPerRound);
    const resting = sortedPlayers.slice(playersPerRound);

    // Update play and rest counts
    activePlayers.forEach((p) => {
      playCounts[p] = (playCounts[p] || 0) + 1;
    });
    resting.forEach((p) => {
      restCounts[p] = (restCounts[p] || 0) + 1;
    });

    // 2. Assign active players to courts and evaluate pairings
    const courtGames: CourtGame[] = [];

    for (let c = 0; c < effectiveCourts; c++) {
      const courtFour = activePlayers.slice(c * 4, (c + 1) * 4);

      // Evaluate all 3 possible doubles pairings of these 4 players
      const possiblePairings: [[string, string], [string, string]][] = [
        [[courtFour[0], courtFour[1]], [courtFour[2], courtFour[3]]],
        [[courtFour[0], courtFour[2]], [courtFour[1], courtFour[3]]],
        [[courtFour[0], courtFour[3]], [courtFour[1], courtFour[2]]],
      ];

      let bestPairing = possiblePairings[0];
      let minPartnerScore = Infinity;

      possiblePairings.forEach((pairing) => {
        const team1Key = getPartnerKey(pairing[0][0], pairing[0][1]);
        const team2Key = getPartnerKey(pairing[1][0], pairing[1][1]);

        // Lower score = less prior partnerships
        const score =
          (partnerCounts[team1Key] || 0) +
          (partnerCounts[team2Key] || 0) +
          Math.random() * 0.05; // tiny tie-breaker

        if (score < minPartnerScore) {
          minPartnerScore = score;
          bestPairing = pairing;
        }
      });

      // Update partner counts
      const finalTeam1Key = getPartnerKey(bestPairing[0][0], bestPairing[0][1]);
      const finalTeam2Key = getPartnerKey(bestPairing[1][0], bestPairing[1][1]);
      partnerCounts[finalTeam1Key] = (partnerCounts[finalTeam1Key] || 0) + 1;
      partnerCounts[finalTeam2Key] = (partnerCounts[finalTeam2Key] || 0) + 1;

      courtGames.push({
        courtNumber: c + 1,
        courtName: `Court ${c + 1}`,
        team1: bestPairing[0],
        team2: bestPairing[1],
      });
    }

    rounds.push({
      roundNumber: i + 1,
      courtGames,
      team1: courtGames[0].team1,
      team2: courtGames[0].team2,
      resting,
    });
  }

  // Compile final player stats
  const stats: PlayerMatchStats[] = cleanPlayers.map((name) => ({
    name,
    matchesPlayed: playCounts[name] || 0,
    restCount: restCounts[name] || 0,
  }));

  return { rounds, stats };
}

/**
 * Formats match schedule for WhatsApp or messaging with multi-court support
 */
export function formatRoundsText(rounds: RoundMatch[], stats: PlayerMatchStats[]): string {
  const maxCourts = Math.max(1, ...rounds.map((r) => r.courtGames?.length || 1));
  let text = `🏸 *Badminton Match Schedule*\n`;
  text += `📅 ${rounds.length} Rounds • ${stats.length} Players${maxCourts > 1 ? ` • ${maxCourts} Courts` : ""}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // If more than 7 players and multiple courts, categorize primarily by courts
  if (stats.length > 7 && maxCourts > 1) {
    for (let c = 0; c < maxCourts; c++) {
      const courtName = `Court ${c + 1}`;
      text += `🏟️ *${courtName.toUpperCase()}*\n`;
      rounds.forEach((r) => {
        const game = r.courtGames && r.courtGames[c];
        if (game) {
          text += `• Rnd ${r.roundNumber}: [${game.team1[0]} & ${game.team1[1]}]  vs  [${game.team2[0]} & ${game.team2[1]}]\n`;
        }
      });
      text += `\n`;
    }

    const hasAnyResting = rounds.some((r) => r.resting.length > 0);
    if (hasAnyResting) {
      text += `💤 *RESTING PLAYERS BY ROUND*\n`;
      rounds.forEach((r) => {
        if (r.resting.length > 0) {
          text += `• Rnd ${r.roundNumber}: ${r.resting.join(", ")}\n`;
        } else {
          text += `• Rnd ${r.roundNumber}: All playing\n`;
        }
      });
      text += `\n`;
    }
  } else {
    // 7 or fewer players (or 1 court): categorize by rounds
    rounds.forEach((r) => {
      text += `*ROUND ${r.roundNumber}*\n`;
      if (r.resting.length > 0) {
        text += `💤 *Resting:* ${r.resting.join(", ")}\n`;
      } else {
        text += `✨ *Resting:* None (All playing)\n`;
      }
      text += `  🏸 [${r.team1[0]} & ${r.team1[1]}]  vs  [${r.team2[0]} & ${r.team2[1]}]\n\n`;
    });
  }

  if (stats.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 *Playtime Distribution:*\n`;
    stats.forEach((s) => {
      text += `• ${s.name}: ${s.matchesPlayed} games (${s.restCount} rests)\n`;
    });
    text += `\n`;
  }

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Generated with Badminton Manager 🏸`;
  return text;
}
