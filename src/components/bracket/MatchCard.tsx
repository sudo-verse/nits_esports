import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type Match = {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: "completed" | "live" | "upcoming";
  time?: string;
};

const getWinner = (m: Match) => (m.scoreA === m.scoreB ? undefined : m.scoreA > m.scoreB ? "A" : "B");

const getMatchLabel = (col?: number, idx?: number) => {
  if (typeof col !== "number" || typeof idx !== "number") return undefined;
  if (col === 0) return `UB${idx + 1}`; // Upper QFs UB1..UB4
  if (col === 1) return `UB${5 + idx}`; // Upper SFs UB5..UB6
  if (col === 2) return `UB7`; // Upper Final
  if (col === 3) return `LB${idx + 1}`; // Lower R1 LB1..LB2
  if (col === 4) return `LB${3 + idx}`; // Lower QFs LB3..LB4
  if (col === 5) return `LB5`; // Lower Semi
  if (col === 6) return `LB6`; // Lower Final
  if (col === 7) return `GF`; // Grand Final
  return undefined;
};

export const MatchCard = ({ match, colIndex, matchIndex, onScoreChange }: { match: Match; colIndex?: number; matchIndex?: number; onScoreChange?: (col: number, mIdx: number, newA: number, newB: number) => void; }) => {
  const winner = getWinner(match);
  const statusLabel = match.status === "completed" ? "COMPLETED" : match.status === "live" ? "LIVE" : match.time ?? "UPCOMING";
  const label = getMatchLabel(colIndex, matchIndex);

  const handleAChange = (v: string) => {
    if (!onScoreChange || typeof colIndex !== 'number' || typeof matchIndex !== 'number') return;
    const n = Number(v) || 0;
    onScoreChange(colIndex, matchIndex, n, match.scoreB);
  };
  const handleBChange = (v: string) => {
    if (!onScoreChange || typeof colIndex !== 'number' || typeof matchIndex !== 'number') return;
    const n = Number(v) || 0;
    onScoreChange(colIndex, matchIndex, match.scoreA, n);
  };

  return (
    <div className="rounded-md border border-border/40 bg-black/80 text-white p-2 sm:p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-wide text-muted-foreground">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {label && (
            <span className="inline-flex h-4 sm:h-5 min-w-7 sm:min-w-8 items-center justify-center rounded-sm bg-neutral-800 px-1.5 sm:px-2 font-semibold text-white">
              {label}
            </span>
          )}
          <span className="opacity-80">{match.time ?? ""}</span>
        </div>
        <Badge variant={match.status === "completed" ? "outline" : "default"} className="px-1.5 sm:px-2 py-0 text-[9px] sm:text-[10px]">
          {statusLabel}
        </Badge>
      </div>

      <div className={`flex items-center justify-between rounded-sm px-2 py-1 ${winner === "A" ? "bg-primary/10" : ""}`}>
        <div className={`truncate text-sm sm:text-base ${winner === "A" ? "font-semibold" : ""}`}>{match.teamA}</div>
        {onScoreChange ? (
          <Input
            type="number"
            className="w-8 sm:w-10 h-6 text-right bg-orange-500 text-black border-none rounded-sm font-bold text-[12px] sm:text-base"
            value={match.scoreA}
            onChange={(e) => handleAChange(e.target.value)}
          />
        ) : (
          <span className="rounded-sm bg-orange-500 px-1.5 sm:px-2 py-0.5 font-orbitron text-black text-sm sm:text-base">{match.scoreA}</span>
        )}
      </div>
      <div className={`mt-1 flex items-center justify-between rounded-sm px-2 py-1 ${winner === "B" ? "bg-primary/10" : ""}`}>
        <div className={`truncate text-sm sm:text-base ${winner === "B" ? "font-semibold" : ""}`}>{match.teamB}</div>
        {onScoreChange ? (
          <Input
            type="number"
            className="w-8 sm:w-10 h-6 text-right bg-orange-500 text-black border-none rounded-sm font-bold text-[12px] sm:text-base"
            value={match.scoreB}
            onChange={(e) => handleBChange(e.target.value)}
          />
        ) : (
          <span className="rounded-sm bg-orange-500 px-1.5 sm:px-2 py-0.5 font-orbitron text-black text-sm sm:text-base">{match.scoreB}</span>
        )}
      </div>
    </div>
  );
};

export const AdvanceCard = ({ team }: { team: string }) => (
  <div className="rounded-md border-2 border-yellow-400 bg-black px-3 py-2 font-medium text-yellow-400">
    {team}
  </div>
);

export default MatchCard;
