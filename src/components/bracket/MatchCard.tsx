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

export const MatchCard = ({ match }: { match: Match }) => {
  const winner = getWinner(match);
  const statusLabel = match.status === "completed" ? "COMPLETED" : match.status === "live" ? "LIVE" : match.time ?? "UPCOMING";

  return (
    <div className="rounded-md border border-border/50 bg-background/60 p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{match.time ?? ""}</span>
        <Badge variant={match.status === "completed" ? "outline" : "default"} className="px-2 py-0 text-[10px]">
          {statusLabel}
        </Badge>
      </div>
      <div className={`flex items-center justify-between rounded-sm px-2 py-1 ${winner === "A" ? "bg-primary/10" : ""}`}>
        <span className={`truncate ${winner === "A" ? "font-semibold" : ""}`}>{match.teamA}</span>
        <span className="font-orbitron">{match.scoreA}</span>
      </div>
      <div className={`mt-1 flex items-center justify-between rounded-sm px-2 py-1 ${winner === "B" ? "bg-primary/10" : ""}`}>
        <span className={`truncate ${winner === "B" ? "font-semibold" : ""}`}>{match.teamB}</span>
        <span className="font-orbitron">{match.scoreB}</span>
      </div>
    </div>
  );
};

export const AdvanceCard = ({ team }: { team: string }) => (
  <div className="rounded-md border-2 border-foreground/80 bg-background px-3 py-2 font-medium">
    {team}
  </div>
);

export default MatchCard;
