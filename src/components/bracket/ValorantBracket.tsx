import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvanceCard, Match, MatchCard } from "./MatchCard";

const upperInitial: Match[] = [
  { teamA: "Gen.G Esports", teamB: "EDward Gaming", scoreA: 1, scoreB: 0, status: "completed", time: "Tue, Jul 2 - 5:30 PM" },
  { teamA: "100 Thieves", teamB: "FNATIC", scoreA: 0, scoreB: 1, status: "completed", time: "Tue, Jul 2 - 5:30 PM" },
];
const upperWinner: Match[] = [
  { teamA: "Gen.G Esports", teamB: "FNATIC", scoreA: 0, scoreB: 2, status: "completed", time: "Tue, Jul 2 - 9:45 PM" },
];
const lowerElim: Match[] = [
  { teamA: "100 Thieves", teamB: "EDward Gaming", scoreA: 1, scoreB: 2, status: "completed", time: "Wed, Jul 3 - 6:00 PM" },
];
const lowerDecider: Match[] = [
  { teamA: "Gen.G Esports", teamB: "EDward Gaming", scoreA: 2, scoreB: 0, status: "completed", time: "Thu, Jul 4 - 8:00 PM" },
];

const groups: Record<string, string[]> = {
  A: ["Gen.G Esports", "EDward Gaming", "FNATIC", "100 Thieves"],
  B: ["Team Heretics", "T1", "Leviatán", "FUT Esports"],
  C: ["LOUD", "NRG", "DRX", "Paper Rex"],
  D: ["Karmine Corp", "Sentinels", "G2 Esports", "Team Liquid"],
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

const ValorantBracket = () => {
  return (
    <Tabs defaultValue="playoffs">
      <TabsList>
        <TabsTrigger value="groups">Group Stage</TabsTrigger>
        <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
      </TabsList>
      <TabsContent value="groups" className="mt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <GroupList id="A" />
          <GroupList id="B" />
          <GroupList id="C" />
          <GroupList id="D" />
        </div>
      </TabsContent>
      <TabsContent value="playoffs" className="mt-6 space-y-10">
        <div>
          <div className="mb-3 text-sm font-semibold">Upper Bracket</div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Column title="Initial Match" matches={upperInitial} />
            <Column title="Winner Match" matches={upperWinner} />
            <div className="space-y-3">
              <div className="text-xs font-medium uppercase text-muted-foreground">Qualified</div>
              <AdvanceCard team="FNATIC" />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Lower Bracket</div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Column title="Elimination Match" matches={lowerElim} />
            <Column title="Decider Match" matches={lowerDecider} />
            <div className="space-y-3">
              <div className="text-xs font-medium uppercase text-muted-foreground">Qualified</div>
              <AdvanceCard team="Gen.G Esports" />
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ValorantBracket;
