import { Player, SplitResult, SplitSummary } from "@/types/badminton";

/**
 * Calculates the cost split for each player based on hours played and total court fee.
 */
export function calculateCostSplit(
  players: Player[],
  totalCost: number
): SplitSummary | null {
  if (players.length === 0 || totalCost <= 0) {
    return null;
  }

  const validPlayers = players.filter((p) => p.name.trim().length > 0 && p.hours > 0);
  if (validPlayers.length === 0) {
    return null;
  }

  const totalHours = validPlayers.reduce((sum, p) => sum + (Number(p.hours) || 0), 0);
  if (totalHours <= 0) {
    return null;
  }

  const costPerHour = totalCost / totalHours;

  const rawResults: SplitResult[] = validPlayers.map((player) => {
    const rawAmount = player.hours * costPerHour;
    const roundedAmount = Math.round(rawAmount);
    const percentage = (player.hours / totalHours) * 100;

    return {
      id: player.id,
      name: player.name.trim(),
      hours: player.hours,
      amount: roundedAmount,
      percentage: Number(percentage.toFixed(1)),
    };
  });

  // Adjust for any small 1-2 LKR rounding discrepancy to ensure the sum matches totalCost exactly
  const sumAmounts = rawResults.reduce((acc, curr) => acc + curr.amount, 0);
  const diff = Math.round(totalCost - sumAmounts);
  if (diff !== 0 && rawResults.length > 0) {
    // Add discrepancy to player with highest hours
    const highestPlayer = rawResults.reduce((prev, current) =>
      prev.hours > current.hours ? prev : current
    );
    highestPlayer.amount += diff;
  }

  return {
    totalCost,
    totalHours: Number(totalHours.toFixed(1)),
    costPerHour: Number(costPerHour.toFixed(2)),
    results: rawResults,
  };
}

/**
 * Generates formatted text for WhatsApp/social sharing
 */
export function formatSplitSummaryText(summary: SplitSummary): string {
  let text = `🏸 *Badminton Court Cost Breakdown*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💰 *Total Court Fee:* ${summary.totalCost.toLocaleString()} LKR\n`;
  text += `⏱️ *Total Court Hours:* ${summary.totalHours} hrs\n`;
  text += `📊 *Rate:* ~${summary.costPerHour.toLocaleString()} LKR/hr\n\n`;
  text += `*Amount to Collect:*\n`;

  summary.results.forEach((p, idx) => {
    text += `${idx + 1}. *${p.name}* (${p.hours} hrs) ➔ *${p.amount.toLocaleString()} LKR*\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Generated with Badminton Manager 🏸`;
  return text;
}
