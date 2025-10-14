import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvanceCard, MatchCard } from "./MatchCard";
import type { Bracket } from "@/types/bracket";

const BracketView = ({ bracket }: { bracket: Bracket }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {bracket.columns.map((col, idx) => (
        <div key={idx} className="space-y-3">
          <div className="text-xs font-medium uppercase text-muted-foreground">{col.title}</div>
          {col.matches.map((m, i) => (
            <MatchCard key={i} match={m} />
          ))}
        </div>
      ))}
      {bracket.winner && (
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase text-muted-foreground">Winner</div>
          <AdvanceCard team={bracket.winner} />
        </div>
      )}
    </div>
  );
};

export default BracketView;
