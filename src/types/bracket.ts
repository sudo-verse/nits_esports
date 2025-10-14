export type Match = {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: "completed" | "live" | "upcoming";
  time?: string;
};

export type BracketColumn = {
  title: string;
  matches: Match[];
};

export type Bracket = {
  columns: BracketColumn[];
  winner?: string;
};
