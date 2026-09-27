export interface Player {
  id: string;
  name: string;
  hours: number;
}

export interface SplitResult {
  id: string;
  name: string;
  hours: number;
  amount: number;
  percentage: number;
}

export interface SplitSummary {
  totalCost: number;
  totalHours: number;
  costPerHour: number;
  results: SplitResult[];
}

export interface RoundMatch {
  roundNumber: number;
  team1: [string, string];
  team2: [string, string];
  resting: string[];
}

export interface PlayerMatchStats {
  name: string;
  matchesPlayed: number;
  restCount: number;
}

export type TabType = 'splitter' | 'rounds';
