import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Leaderboard = () => {
  const topPlayers = [
    {
      rank: 1,
      name: "ShadowStrike",
      points: 2850,
      wins: 45,
      matches: 52,
      trend: "up",
    },
    {
      rank: 2,
      name: "PhoenixFury",
      points: 2720,
      wins: 42,
      matches: 50,
      trend: "up",
    },
    {
      rank: 3,
      name: "NeonBlade",
      points: 2650,
      wins: 38,
      matches: 48,
      trend: "down",
    },
    {
      rank: 4,
      name: "CyberPulse",
      points: 2580,
      wins: 40,
      matches: 51,
      trend: "up",
    },
    {
      rank: 5,
      name: "QuantumGamer",
      points: 2490,
      wins: 36,
      matches: 46,
      trend: "same",
    },
    {
      rank: 6,
      name: "VortexHunter",
      points: 2420,
      wins: 35,
      matches: 45,
      trend: "up",
    },
    {
      rank: 7,
      name: "NovaStorm",
      points: 2380,
      wins: 33,
      matches: 44,
      trend: "down",
    },
    {
      rank: 8,
      name: "TechNinja",
      points: 2340,
      wins: 32,
      matches: 43,
      trend: "same",
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-accent" />;
      case 2:
        return <Medal className="h-6 w-6 text-secondary" />;
      case 3:
        return <Award className="h-6 w-6 text-primary" />;
      default:
        return <span className="text-muted-foreground font-bold">{rank}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down") return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    return <span className="text-muted-foreground">-</span>;
  };

  const winRate = (wins: number, matches: number) => {
    return ((wins / matches) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-5xl font-bold mb-4 text-gradient">
            Leaderboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Top players competing for glory in our esports community
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Players
              </CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-orbitron font-bold text-gradient">248</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Matches
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-orbitron font-bold text-gradient">1,432</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Season
              </CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-orbitron font-bold text-gradient">Season 1</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="font-orbitron text-2xl">Top Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="font-orbitron">Rank</TableHead>
                    <TableHead className="font-orbitron">Player</TableHead>
                    <TableHead className="font-orbitron text-right">Points</TableHead>
                    <TableHead className="font-orbitron text-right">Matches</TableHead>
                    <TableHead className="font-orbitron text-right">Win Rate</TableHead>
                    <TableHead className="font-orbitron text-center">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPlayers.map((player) => (
                    <TableRow
                      key={player.rank}
                      className={`border-border/50 hover:bg-primary/5 transition-colors ${
                        player.rank <= 3 ? "bg-primary/5" : ""
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(player.rank)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-orbitron font-semibold">{player.name}</span>
                          {player.rank === 1 && (
                            <Badge className="bg-accent/20 text-accent border-accent/50">
                              Champion
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-primary">{player.points.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {player.wins}/{player.matches}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-secondary">
                          {winRate(player.wins, player.matches)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getTrendIcon(player.trend)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
