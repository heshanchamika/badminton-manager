import { RoundMatch, PlayerMatchStats } from "@/types/badminton";

/**
 * Calculates a sensible default number of matches based on player count
 */
export function getSuggestedMatchCount(playerCount: number): number {
  if (playerCount <= 4) return 3;
  if (playerCount === 5) return 5;
  return Math.floor(playerCount * 1.5);
}

/**
 * Generates fair doubles match rotations:
 * 1. Prioritizes resting players who have played the most matches
 * 2. Minimizes duplicate doubles partnerships
 */
export function generateFairRounds(
  playerNames: string[],
  numRounds: number
): { rounds: RoundMatch[]; stats: PlayerMatchStats[] } {
  const cleanPlayers = playerNames.map((p) => p.trim()).filter((p) => p.length > 0);

  if (cleanPlayers.length < 4 || numRounds < 1) {
    return { rounds: [], stats: [] };
  }

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
    // 1. Sort players to pick 4 with the least play counts
    // First shuffle to randomly break ties
    const sortedPlayers = [...cleanPlayers]
      .sort(() => 0.5 - Math.random())
      .sort((a, b) => playCounts[a] - playCounts[b]);

    const court = sortedPlayers.slice(0, 4);
    const resting = sortedPlayers.slice(4);

    // Update play and rest counts
    court.forEach((p) => {
      playCounts[p] = (playCounts[p] || 0) + 1;
    });
    resting.forEach((p) => {
      restCounts[p] = (restCounts[p] || 0) + 1;
    });

    // 2. Evaluate all 3 possible doubles pairings of the 4 court players
    const possiblePairings: [[string, string], [string, string]][] = [
      [[court[0], court[1]], [court[2], court[3]]],
      [[court[0], court[2]], [court[1], court[3]]],
      [[court[0], court[3]], [court[1], court[2]]],
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

    rounds.push({
      roundNumber: i + 1,
      team1: bestPairing[0],
      team2: bestPairing[1],
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
 * Formats match schedule for WhatsApp or messaging
 */
export function formatRoundsText(rounds: RoundMatch[], stats: PlayerMatchStats[]): string {
  let text = `🏸 *Badminton Match Schedule*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;

  rounds.forEach((r) => {
    text += `*Round ${r.roundNumber}*\n`;
    text += `🔵 Team 1: ${r.team1[0]} & ${r.team1[1]}\n`;
    text += `🔴 Team 2: ${r.team2[0]} & ${r.team2[1]}\n`;
    if (r.resting.length > 0) {
      text += `☕ Resting: ${r.resting.join(", ")}\n`;
    }
    text += `\n`;
  });

  if (stats.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 *Fairness Stats:*\n`;
    stats.forEach((s) => {
      text += `• ${s.name}: ${s.matchesPlayed} games (${s.restCount} rests)\n`;
    });
  }

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Generated with Badminton Manager 🏸`;
  return text;
}
