import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvanceCard, MatchCard } from "./MatchCard";
import type { Bracket } from "@/types/bracket";

const padClass = (effectiveCol: number) => {
  switch (effectiveCol) {
    case 1:
      return "pt-8 md:pt-16";
    case 2:
      return "pt-12 md:pt-28";
    case 5:
      return "pt-8 md:pt-16";
    case 6:
      return "pt-12 md:pt-28";
    default:
      return "";
  }
};

const BracketView = ({ bracket, onScoreChange, colOffset = 0 }: { bracket: Bracket; onScoreChange?: (col: number, mIdx: number, newA: number, newB: number) => void; colOffset?: number }) => {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-4 md:gap-6">
        {bracket.columns.map((col, idx) => {
          const effectiveCol = idx + (colOffset || 0);
          return (
            <div
              key={idx}
              className={`w-[220px] sm:w-[260px] flex-shrink-0 space-y-3 ${idx > 0 ? "border-l-2 border-dashed border-border/30 pl-4" : ""} ${padClass(effectiveCol)}`}
            >
              <div className="text-[10px] sm:text-[11px] font-semibold uppercase text-muted-foreground tracking-wide whitespace-nowrap">{col.title}</div>
              {col.matches.map((m, i) => (
                <MatchCard key={i} match={m} colIndex={effectiveCol} matchIndex={i} onScoreChange={onScoreChange} />
              ))}
            </div>
          );
        })}
        {bracket.winner && (
          <div className="w-[220px] sm:w-[260px] flex-shrink-0 space-y-3 border-l-2 border-dashed border-border/30 pl-4 pt-16 md:pt-32">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">Winner</div>
            <AdvanceCard team={bracket.winner} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BracketView;
