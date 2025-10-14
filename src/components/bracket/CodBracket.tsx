import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvanceCard, Match, MatchCard } from "./MatchCard";

const qf: Match[] = [
  { teamA: "OpTic", teamB: "100 Thieves", scoreA: 3, scoreB: 1, status: "completed", time: "Sun, Jul 27 - 10:00 AM" },
  { teamA: "Boston Breach", teamB: "Team Heretics", scoreA: 1, scoreB: 3, status: "completed", time: "Sat, Jul 26 - 7:00 PM" },
  { teamA: "Movistar KOI", teamB: "Vancouver Surge", scoreA: 1, scoreB: 3, status: "completed", time: "Sat, Jul 26 - 10:30 PM" },
  { teamA: "Five Years", teamB: "Vancouver Surge", scoreA: 2, scoreB: 3, status: "completed", time: "Sun, Jul 27 - 7:30 PM" },
];
const sf: Match[] = [
  { teamA: "Team Heretics", teamB: "OpTic", scoreA: 2, scoreB: 3, status: "completed", time: "Sun, Jul 27 - 9:00 PM" },
  { teamA: "Vancouver Surge", teamB: "Movistar KOI", scoreA: 3, scoreB: 2, status: "completed", time: "Sun, Jul 27 - 7:30 PM" },
];
const gf: Match[] = [
  { teamA: "Vancouver Surge", teamB: "OpTic", scoreA: 0, scoreB: 4, status: "completed", time: "Mon, Jul 28 - 12:05 AM" },
];

const groups: Record<string, string[]> = {
  A: ["OpTic", "100 Thieves", "Boston Breach", "Team Heretics"],
  B: ["Movistar KOI", "Vancouver Surge", "Five Years", "NY Subliners"],
};

const GroupList = ({ id }: { id: keyof typeof groups }) => (
  <Card>
    <CardHeader>
      <CardTitle className="font-orbitron">Group {id}</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {groups[id].map((t, i) => (
          <li key={t} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
            <span>
              <span className="mr-2 text-muted-foreground">{i + 1}.</span>
              {t}
            </span>
            <span className="font-orbitron text-sm">0 pts</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const Column = ({ title, matches }: { title: string; matches: Match[] }) => (
  <div className="space-y-3">
    <div className="text-xs font-medium uppercase text-muted-foreground">{title}</div>
    {matches.map((m, i) => (
      <MatchCard key={i} match={m} />
    ))}
  </div>
);

const CodBracket = () => {
  return (
    <Tabs defaultValue="playoffs">
      <TabsList>
        <TabsTrigger value="groups">Group Stage</TabsTrigger>
        <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
      </TabsList>
      <TabsContent value="groups" className="mt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GroupList id="A" />
          <GroupList id="B" />
        </div>
      </TabsContent>
      <TabsContent value="playoffs" className="mt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Column title="Quarterfinal" matches={qf} />
          <Column title="Semifinal" matches={sf} />
          <Column title="Grand Final" matches={gf} />
          <div className="space-y-3">
            <div className="text-xs font-medium uppercase text-muted-foreground">Winner</div>
            <AdvanceCard team="OpTic" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CodBracket;
