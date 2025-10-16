import { Link, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { getEventById } from "@/data/eventsStore";
import { isAuthed } from "@/auth/auth";
import { supabase } from "@/lib/supabase";
import { fetchPointsSnapshot, savePointsSnapshot, isSupabaseConfigured } from "@/data/leaderboardPoints";
import BracketView from "@/components/bracket/BracketView";
import type { Bracket } from "@/types/bracket";
import mlImg from "@/assets/ml.jpg";
import valorantImg from "@/assets/valorant.jpg";
import codImg from "@/assets/cod.jpg";
import bgmiImg from "@/assets/bgmi.jpg";
import freefireImg from "@/assets/freefire.jpg";

type GroupLetter = "A" | "B" | "C" | "D";

type SimpleGroupRow = {
  rank: number;
  team: string;
  points: number;
  gamesPlayed?: number;
  gamesWon?: number;
  originalIndex?: number;
};

type MobileLegendsGroupState = Record<GroupLetter, SimpleGroupRow[]>;

type DerivedGroupStats = {
  gamesPlayed: number;
  gamesWon: number;
};

type MobileLegendsStatKey = "gamesPlayed" | "gamesWon";

const GROUP_LETTERS: GroupLetter[] = ["A", "B", "C", "D"];

const cloneGroupRows = (source: Record<GroupLetter, SimpleGroupRow[]>): MobileLegendsGroupState => {
  return GROUP_LETTERS.reduce((acc, letter) => {
    const rows = source[letter] ?? [];
    acc[letter] = rows.map((row, index) => ({ ...row, originalIndex: row.originalIndex ?? index }));
    return acc;
  }, {} as MobileLegendsGroupState);
};

const deriveGroupRowStats = (row: SimpleGroupRow): DerivedGroupStats => {
  const gamesPlayed = row.gamesPlayed ?? Math.max(1, Math.floor(row.points / 50));
  const gamesWon = row.gamesWon ?? Math.max(0, Math.floor(gamesPlayed * 0.6));
  return { gamesPlayed, gamesWon };
};

const mobileLegendsGroupData: Record<GroupLetter, SimpleGroupRow[]> = {
  A: [
    { rank: 1, team: "RRQ Hoshi", points: 184 },
    { rank: 2, team: "ONIC Esports", points: 176 },
    { rank: 3, team: "Blacklist International", points: 168 },
    { rank: 4, team: "Falcon Esports", points: 152 },
  ],
  B: [
    { rank: 1, team: "EVOS Legends", points: 182 },
    { rank: 2, team: "Burn x Flash", points: 170 },
    { rank: 3, team: "Bigetron Alpha", points: 158 },
    { rank: 4, team: "Rebellion Zion", points: 146 },
  ],
  C: [
    { rank: 1, team: "Team SMG", points: 188 },
    { rank: 2, team: "AP.Bren", points: 174 },
    { rank: 3, team: "RSG Philippines", points: 160 },
    { rank: 4, team: "HomeBois", points: 148 },
  ],
  D: [
    { rank: 1, team: "Echo Philippines", points: 186 },
    { rank: 2, team: "Geek Fam", points: 168 },
    { rank: 3, team: "Todak", points: 154 },
    { rank: 4, team: "See You Soon", points: 140 },
  ],
};

const createSequentialGroupRows = ({
  count,
  startRank,
  startTeamNumber,
  basePoints,
  step,
}: {
  count: number;
  startRank: number;
  startTeamNumber: number;
  basePoints: number;
  step: number;
}): SimpleGroupRow[] =>
  Array.from({ length: count }, (_, index) => ({
    rank: startRank + index,
    team: `Team ${startTeamNumber + index}`,
    points: basePoints + (count - index) * step,
  }));

type FreeFireMatchStats = {
  gamesPlayed: number;
  booyah: number;
  placement: number;
  kills: number;
  points: number;
};

type FreeFireMatches = {
  match1: FreeFireMatchStats;
  match2: FreeFireMatchStats;
};

type FreeFireMatchKey = keyof FreeFireMatches;

const createEmptyFreeFireMatch = (): FreeFireMatchStats => ({
  gamesPlayed: 0,
  booyah: 0,
  placement: 0,
  kills: 0,
  points: 0,
});

const createEmptyFreeFireMatches = (): FreeFireMatches => ({
  match1: createEmptyFreeFireMatch(),
  match2: createEmptyFreeFireMatch(),
});

const createFreeFireGroupRows = ({
  count,
  startRank,
  startTeamNumber,
  basePoints,
  step,
}: {
  count: number;
  startRank: number;
  startTeamNumber: number;
  basePoints: number;
  step: number;
}): FreeFireRow[] =>
  Array.from({ length: count }, (_, index) => ({
    rank: startRank + index,
    team: `Team ${startTeamNumber + index}`,
    gamesPlayed: 0,
    booyah: 0,
    placement: 0,
    kills: 0,
    points: 0,
    matches: createEmptyFreeFireMatches(),
    originalIndex: index,
  }));

const defaultGroupDRows: SimpleGroupRow[] = [
  { rank: 1, team: "Storm", points: 210 },
  { rank: 2, team: "Wolves", points: 190 },
  { rank: 3, team: "Dragons", points: 165 },
  { rank: 4, team: "Rookies", points: 130 },
];

// Free Fire specific types
type FreeFireRow = {
  rank: number;
  team: string;
  gamesPlayed: number;
  booyah: number; // wwcd / booyah count
  placement: number; // placement points (overall)
  kills: number; // kill points (overall)
  points: number; // total points (overall)
  matches?: {
    match1: { gamesPlayed: number; booyah: number; placement: number; kills: number; points: number };
    match2: { gamesPlayed: number; booyah: number; placement: number; kills: number; points: number };
    match3?: { gamesPlayed: number; booyah: number; placement: number; kills: number; points: number };
  };
  originalIndex?: number;
};

type FreeFireGroupState = Record<GroupLetter, FreeFireRow[]>;

type FreeFireSemifinalMatchKey = "match1" | "match2" | "match3";

type FreeFireSemifinalMatchStats = {
  booyah: number;
  placement: number;
  kills: number;
  points: number;
};

type FreeFireSemifinalMatches = Record<FreeFireSemifinalMatchKey, FreeFireSemifinalMatchStats>;

type FreeFireSemifinalRow = {
  id: string;
  group: GroupLetter;
  seedIndex: number;
  team: string;
  matches: FreeFireSemifinalMatches;
};

const SEMIFINAL_MATCH_KEYS: FreeFireSemifinalMatchKey[] = ["match1", "match2", "match3"];

const createEmptySemifinalMatch = (): FreeFireSemifinalMatchStats => ({
  booyah: 0,
  placement: 0,
  kills: 0,
  points: 0,
});

const createEmptySemifinalMatches = (): FreeFireSemifinalMatches => ({
  match1: createEmptySemifinalMatch(),
  match2: createEmptySemifinalMatch(),
  match3: createEmptySemifinalMatch(),
});

const normalizeSemifinalMatches = (
  matches?: Partial<Record<FreeFireSemifinalMatchKey, Partial<FreeFireSemifinalMatchStats>>>
): FreeFireSemifinalMatches => {
  const base = createEmptySemifinalMatches();
  SEMIFINAL_MATCH_KEYS.forEach((key) => {
    const data = matches?.[key] ?? {};
    const booyah = Number((data?.booyah ?? 0) as number) || 0;
    const placement = Number((data?.placement ?? 0) as number) || 0;
    const kills = Number((data?.kills ?? 0) as number) || 0;
    base[key] = {
      booyah,
      placement,
      kills,
      points: placement + kills,
    };
  });
  return base;
};

const normalizeSemifinalRow = (row: any, fallbackGroup: GroupLetter, fallbackIndex: number): FreeFireSemifinalRow => {
  const group = (row?.group as GroupLetter) ?? fallbackGroup;
  const seedIndexCandidate = typeof row?.seedIndex === "number" ? row.seedIndex : Number(row?.seedIndex ?? fallbackIndex);
  const seedIndex = Number.isFinite(seedIndexCandidate) ? seedIndexCandidate : fallbackIndex;
  const id = row?.id ?? `${group}-${seedIndex}`;
  const team = typeof row?.team === "string" && row.team.trim().length > 0 ? row.team : `Team ${fallbackIndex + 1}`;
  return {
    id,
    group,
    seedIndex,
    team,
    matches: normalizeSemifinalMatches(row?.matches),
  };
};

const getGroupRowsForGame = (
  gameId: string | undefined,
  group: GroupLetter,
  mobileLegendsGroups?: MobileLegendsGroupState
): SimpleGroupRow[] => {
  if (gameId === "ml") {
    const sourceGroups = mobileLegendsGroups ?? mobileLegendsGroupData;
    const baseRows = (sourceGroups[group] ?? mobileLegendsGroupData[group]).map((row, index) => ({
      ...row,
      originalIndex: row.originalIndex ?? index,
    }));

    const rowsWithStats = baseRows.map((row) => {
      const stats = deriveGroupRowStats(row);
      return { ...row, ...stats };
    });

    rowsWithStats.sort((a, b) => {
      if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
      return a.team.localeCompare(b.team);
    });

    return rowsWithStats.map((row, index) => ({ ...row, rank: index + 1 }));
  }

  if (gameId === "freefire" && group === "D") {
    return Array.from({ length: 12 }, (_, index) => ({
      rank: index + 1,
      team: `Team ${index + 37}`,
      points: 100 + (12 - index) * 7,
    }));
  }

  switch (group) {
    case "A":
      return createSequentialGroupRows({ count: 8, startRank: 1, startTeamNumber: 1, basePoints: 100, step: 10 });
    case "B":
      return createSequentialGroupRows({ count: 8, startRank: 9, startTeamNumber: 9, basePoints: 100, step: 9 });
    case "C":
      return createSequentialGroupRows({ count: 8, startRank: 17, startTeamNumber: 17, basePoints: 100, step: 8 });
    case "D":
    default:
      return defaultGroupDRows.map((row) => ({ ...row }));
  }
};

const EventLeaderboard = () => {
  const params = useParams();
  const navigate = useNavigate();
  const eventId = params.eventId as string;
  const gameId = params.gameId as string | undefined;

  const baseEvent = getEventById(eventId);

  // Provide a special in-memory event for the standalone Lock & Load page
  const lockLoadHero = "https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2F21e5721d76704013a2fd522cdf0daa0e?format=webp&width=1600";

  const specialLockLoad = baseEvent === undefined && eventId === "lock-load" ? {
    id: "lock-load",
    title: "Lock & Load",
    date: "TBA",
    location: "TBA",
    participants: "124",
    prize: "2,000",
    status: "live",
    image: lockLoadHero,
    games: [
      {
        id: "ml",
        name: "Mobile Legends",
        image: mlImg,
        participants: "80",
        gameHead: { name: "Vaibhav Raj", phone: "8434307257" },
        format: "points",
        rankings: [
          { rank: 1, team: "Storm", points: 210, prize: "��2,000" },
          { rank: 2, team: "Wolves", points: 190, prize: "₹1,500" },
          { rank: 3, team: "Dragons", points: 165, prize: "���1,000" },
        ],
      },
      {
        id: "valorant",
        name: "Valorant",
        image: valorantImg,
        participants: "40",
        gameHead: { name: "Sunil Kushwah", phone: "7083644807" },
        format: "points",
        rankings: [
          { rank: 1, team: "Gen.G", points: 230, prize: "₹2,000" },
          { rank: 2, team: "FNATIC", points: 210, prize: "₹1,500" },
          { rank: 3, team: "T1", points: 195, prize: "₹1,000" },
        ],
      },
      {
        id: "codm",
        name: "COD Mobile",
        image: codImg,
        participants: "70",
        gameHead: { name: "Abhishek Kumar", phone: "8877155782" },
        format: "points",
        rankings: [
          { rank: 1, team: "OpTic", points: 225, prize: "₹2,000" },
          { rank: 2, team: "LOUD", points: 200, prize: "₹1,500" },
          { rank: 3, team: "Cloud9", points: 180, prize: "₹1,000" },
        ],
      },
      {
        id: "bgmi",
        name: "BGMI",
        image: bgmiImg,
        participants: "124",
        gameHead: { name: "Arkaprovo Mukherjee", phone: "9563136407" },
        format: "points",
        rankings: [
          { rank: 1, team: "Storm", points: 210, prize: "₹2,000" },
          { rank: 2, team: "Wolves", points: 190, prize: "₹1,500" },
          { rank: 3, team: "Dragons", points: 165, prize: "₹1,000" },
        ],
      },
      {
        id: "freefire",
        name: "Free Fire",
        image: freefireImg,
        participants: "184",
        gameHead: { name: "Suryans Singh", phone: "6307843856" },
        format: "points",
        rankings: [
          { rank: 1, team: "Storm", points: 210, prize: "₹2,000" },
          { rank: 2, team: "Wolves", points: 190, prize: "₹1,500" },
          { rank: 3, team: "Dragons", points: 165, prize: "₹1,000" },
        ],
      },
    ],
  } : undefined;

  const event = baseEvent ?? specialLockLoad;

  const [mlGroupData, setMlGroupData] = useState<MobileLegendsGroupState>(() => cloneGroupRows(mobileLegendsGroupData));

  // Mobile Legends bracket state (initialized from group results)
  const [mlBracket, setMlBracket] = useState<Bracket | null>(null);

  const buildMlBracketFromGroups = (): Bracket => {
    const sortByPoints = (letter: GroupLetter) => {
      const base = (mlGroupData[letter] ?? mobileLegendsGroupData[letter]).map((r, i) => ({ ...r, originalIndex: r.originalIndex ?? i }));
      const withStats = base.map((r) => {
        const pts = typeof r.points === 'number' ? r.points : Number(r.points) || 0;
        const stats = deriveGroupRowStats(r);
        return { ...r, points: pts, ...stats };
      });
      withStats.sort((a, b) => {
        const aw = Number(a.gamesWon ?? 0) || 0;
        const bw = Number(b.gamesWon ?? 0) || 0;
        if (bw !== aw) return bw - aw;
        const ap = Number(a.points ?? 0) || 0;
        const bp = Number(b.points ?? 0) || 0;
        if (bp !== ap) return bp - ap;
        return a.team.localeCompare(b.team);
      });
      return withStats.slice(0, 2).map(r => r.team);
    };

    const A = sortByPoints('A');
    const B = sortByPoints('B');
    const C = sortByPoints('C');
    const D = sortByPoints('D');

    const quarterfinals = [
      { teamA: A[0] ?? '��', teamB: D[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' },
      { teamA: B[0] ?? '—', teamB: C[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' },
      { teamA: C[0] ?? '—', teamB: B[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' },
      { teamA: D[0] ?? '—', teamB: A[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' },
    ];

    const upperSemis = [
      { teamA: 'Winner UB1', teamB: 'Winner UB2', scoreA: 0, scoreB: 0, status: 'upcoming' },
      { teamA: 'Winner UB3', teamB: 'Winner UB4', scoreA: 0, scoreB: 0, status: 'upcoming' },
    ];

    const upperFinal = [
      { teamA: 'Winner UB5', teamB: 'Winner UB6', scoreA: 0, scoreB: 0, status: 'upcoming' },
    ];

    const lowerRound1 = [
      { teamA: 'Loser UB1', teamB: 'Loser UB2', scoreA: 0, scoreB: 0, status: 'upcoming' },
      { teamA: 'Loser UB3', teamB: 'Loser UB4', scoreA: 0, scoreB: 0, status: 'upcoming' },
    ];

    const lowerQFs = [
      { teamA: 'Winner LB1', teamB: 'Loser UB6', scoreA: 0, scoreB: 0, status: 'upcoming' },
      { teamA: 'Winner LB2', teamB: 'Loser UB5', scoreA: 0, scoreB: 0, status: 'upcoming' },
    ];

    const lowerSemi = [
      { teamA: 'Winner LB3', teamB: 'Winner LB4', scoreA: 0, scoreB: 0, status: 'upcoming' },
    ];

    const lowerFinal = [
      { teamA: 'Loser UB7', teamB: 'Winner LB5', scoreA: 0, scoreB: 0, status: 'upcoming' },
    ];

    const grandFinal = [
      { teamA: 'Winner UB7', teamB: 'Winner LB6', scoreA: 0, scoreB: 0, status: 'upcoming' },
    ];

    return { columns: [
      { title: 'Upper • Quarterfinals', matches: quarterfinals },
      { title: 'Upper • Semifinals', matches: upperSemis },
      { title: 'Upper • Final', matches: upperFinal },
      { title: 'Lower • Round 1 (Elimination)', matches: lowerRound1 },
      { title: 'Lower • Quarterfinals', matches: lowerQFs },
      { title: 'Lower • Semifinal', matches: lowerSemi },
      { title: 'Lower • Final', matches: lowerFinal },
      { title: 'Grand Final', matches: grandFinal },
    ] } as Bracket;
  };

  useEffect(() => {
    const hasStarted = !!mlBracket && mlBracket.columns.some(col => col.matches.some(m => m.status !== 'upcoming' || m.scoreA !== 0 || m.scoreB !== 0));
    if (!mlBracket || !hasStarted) {
      setMlBracket(buildMlBracketFromGroups());
    }
  }, [mlGroupData]);

  // Propagate winners/losers through bracket after a score update
  const propagateMatches = (br: Bracket, col: number, mIdx: number) => {
    const updated = { ...br, columns: br.columns.map(c => ({ ...c, matches: c.matches.map(m => ({ ...m })) })) } as Bracket;
    const match = updated.columns[col].matches[mIdx];
    if (!match) return updated;
    if (match.scoreA === match.scoreB) return updated;
    const winner = match.scoreA > match.scoreB ? match.teamA : match.teamB;
    const loser = match.scoreA > match.scoreB ? match.teamB : match.teamA;

    // Column mappings based on layout
    if (col === 0) {
      // UB -> upper semis and lower round1
      const ufMap = [ [1,0,'teamA'], [1,0,'teamB'], [1,1,'teamA'], [1,1,'teamB'] ];
      const lbMap = [ [3,0,'teamA'], [3,0,'teamB'], [3,1,'teamA'], [3,1,'teamB'] ];
      const [ufCol, ufMatch, ufSide] = ufMap[mIdx] as any;
      const [lbCol, lbMatch, lbSide] = lbMap[mIdx] as any;
      (updated.columns[ufCol].matches[ufMatch] as any)[ufSide] = winner;
      (updated.columns[lbCol].matches[lbMatch] as any)[lbSide] = loser;
    }

    if (col === 1) {
      // upper semis -> upper final and lowerQFs losers
      (updated.columns[2].matches[0] as any)[mIdx === 0 ? 'teamA' : 'teamB'] = winner;
      if (mIdx === 0) {
        (updated.columns[4].matches[1] as any).teamB = loser; // LB4 gets Loser UB5
      } else {
        (updated.columns[4].matches[0] as any).teamB = loser; // LB3 gets Loser UB6
      }
    }

    if (col === 2) {
      // upper final
      (updated.columns[7].matches[0] as any).teamA = winner;
      (updated.columns[6].matches[0] as any).teamA = loser;
    }

    if (col === 3) {
      // lower round1 -> to lowerQFs.teamA
      const winnerTeam = match.scoreA > match.scoreB ? match.teamA : match.teamB;
      const target = mIdx === 0 ? 0 : 1;
      (updated.columns[4].matches[target] as any).teamA = winnerTeam;
    }

    if (col === 4) {
      // lower QFs -> lowerSemi
      const winnerTeam = match.scoreA > match.scoreB ? match.teamA : match.teamB;
      (updated.columns[5].matches[0] as any)[mIdx === 0 ? 'teamA' : 'teamB'] = winnerTeam;
    }

    if (col === 5) {
      // lower semi -> lower final.teamB
      const winnerTeam = match.scoreA > match.scoreB ? match.teamA : match.teamB;
      (updated.columns[6].matches[0] as any).teamB = winnerTeam;
    }

    if (col === 6) {
      // lower final -> grand final.teamB
      const winnerTeam = match.scoreA > match.scoreB ? match.teamA : match.teamB;
      (updated.columns[7].matches[0] as any).teamB = winnerTeam;
    }

    if (col === 7) {
      const champ = updated.columns[7].matches[0].scoreA > updated.columns[7].matches[0].scoreB ? updated.columns[7].matches[0].teamA : updated.columns[7].matches[0].teamB;
      (updated as any).winner = champ;
    }

    return updated;
  };

  const handleMlScoreChange = (col: number, mIdx: number, newA: number, newB: number) => {
    setMlBracket((prev) => {
      if (!prev) return prev;
      const next = { ...prev, columns: prev.columns.map(c => ({ ...c, matches: c.matches.map(m => ({ ...m })) })) } as Bracket;
      next.columns[col].matches[mIdx].scoreA = newA;
      next.columns[col].matches[mIdx].scoreB = newB;
      if (newA !== newB) next.columns[col].matches[mIdx].status = 'completed';
      const propagated = propagateMatches(next, col, mIdx);
      return propagated;
    });
    setIsDirty(true);
  };
  // Free Fire groups state (editable by admin)
  const [freefireGroups, setFreefireGroups] = useState<FreeFireGroupState>(() => ({
    A: createFreeFireGroupRows({ count: 12, startRank: 1, startTeamNumber: 1, basePoints: 120, step: 6 }),
    B: createFreeFireGroupRows({ count: 12, startRank: 13, startTeamNumber: 13, basePoints: 120, step: 6 }),
    C: createFreeFireGroupRows({ count: 11, startRank: 25, startTeamNumber: 25, basePoints: 120, step: 6 }),
    D: createFreeFireGroupRows({ count: 11, startRank: 36, startTeamNumber: 36, basePoints: 120, step: 6 }),
  }));

  // Helper: compute sorted rows for a group by totalPoints (placement + kills)
  const getSortedGroupRows = (letter: GroupLetter, groups: FreeFireGroupState) => {
    const rows = (groups?.[letter] ?? []) as any[];
    const withTotals = rows.map((row: any) => {
      const m1 = row.matches?.match1 ?? { placement: 0, kills: 0, booyah: 0 };
      const m2 = row.matches?.match2 ?? { placement: 0, kills: 0, booyah: 0 };
      const totalBooyah = (m1.booyah || 0) + (m2.booyah || 0);
      const totalPlacement = (m1.placement || 0) + (m2.placement || 0);
      const totalKills = (m1.kills || 0) + (m2.kills || 0);
      // Prefer computed totals from match details, but fall back to any stored `points` value
      const computedPoints = totalPlacement + totalKills;
      const storedPoints = (typeof row.points === 'number' ? row.points : Number(row.points)) || (row.totalPoints ?? 0);
      const totalPoints = computedPoints || storedPoints || 0;
      return { ...row, totalBooyah, totalPlacement, totalKills, totalPoints };
    });
    return withTotals.sort((a: any, b: any) => b.totalPoints - a.totalPoints);
  };

  const buildSemifinalRowsFromGroups = (groups: FreeFireGroupState): FreeFireSemifinalRow[] => {
    const rows: FreeFireSemifinalRow[] = [];
    GROUP_LETTERS.forEach((letter) => {
      const topRows = getSortedGroupRows(letter, groups).slice(0, 3);
      topRows.forEach((row: any, idx: number) => {
        const seedIndex = row.originalIndex ?? idx;
        rows.push({
          id: `${letter}-${seedIndex}`,
          group: letter,
          seedIndex,
          team: row.team,
          matches: createEmptySemifinalMatches(),
        });
      });
    });
    return rows;
  };

  const [semifinalRows, setSemifinalRows] = useState<FreeFireSemifinalRow[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (gameId !== "freefire") return;
    setSemifinalRows((prev) => {
      if (prev.length > 0) return prev;
      return buildSemifinalRowsFromGroups(freefireGroups);
    });
  }, [gameId, freefireGroups]);

  const updateFreefireMatchStat = useCallback(
    (group: GroupLetter, originalIndex: number, matchKey: FreeFireMatchKey, field: "booyah" | "placement" | "kills", rawValue: string) => {
      const parsed = Number(rawValue);
      const numericValue = Number.isFinite(parsed) ? parsed : 0;

      setFreefireGroups((prev) => {
        const groupRows = (prev[group] ?? []).map((row, index) => {
          if (index !== originalIndex) return row;
          const existingMatches = row.matches ?? createEmptyFreeFireMatches();
          const existingMatch = existingMatches[matchKey] ?? createEmptyFreeFireMatch();
          const updatedMatch = {
            ...existingMatch,
            [field]: numericValue,
          } as FreeFireMatchStats;

          const placementValue = field === "placement" ? numericValue : existingMatch.placement ?? 0;
          const killsValue = field === "kills" ? numericValue : existingMatch.kills ?? 0;

          return {
            ...row,
            matches: {
              ...existingMatches,
              [matchKey]: {
                ...updatedMatch,
                points: placementValue + killsValue,
              },
            },
          };
        });

        return {
          ...prev,
          [group]: groupRows,
        };
      });

      setIsDirty(true);
    },
    [setFreefireGroups, setIsDirty]
  );

  const updateSemifinalMatchStat = useCallback(
    (rowId: string, matchKey: FreeFireSemifinalMatchKey, field: "booyah" | "placement" | "kills", value: string) => {
      const numericValue = Number(value);
      const parsed = Number.isFinite(numericValue) ? numericValue : 0;

      setSemifinalRows((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row;
          const currentMatch = row.matches[matchKey];
          const updatedMatch = {
            ...currentMatch,
            [field]: parsed,
          };
          const points = (updatedMatch.placement || 0) + (updatedMatch.kills || 0);
          return {
            ...row,
            matches: {
              ...row.matches,
              [matchKey]: {
                ...updatedMatch,
                points,
              },
            },
          };
        })
      );
      setIsDirty(true);
    },
    [setSemifinalRows, setIsDirty]
  );

  const semifinalOverviewRows = useMemo(() => {
    return semifinalRows
      .map((row) => {
        const totals = SEMIFINAL_MATCH_KEYS.reduce(
          (acc, key) => {
            const match = row.matches[key];
            acc.booyah += match.booyah || 0;
            acc.placement += match.placement || 0;
            acc.kills += match.kills || 0;
            return acc;
          },
          { booyah: 0, placement: 0, kills: 0 }
        );
        const totalPoints = totals.placement + totals.kills;
        return {
          id: row.id,
          group: row.group,
          team: row.team,
          totalBooyah: totals.booyah,
          totalPlacement: totals.placement,
          totalKills: totals.kills,
          totalPoints,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((row, index) => ({
        ...row,
        rank: index + 1,
      }));
  }, [semifinalRows]);

  const CODM_MATCH_KEYS = ["match1", "match2", "match3"] as const;
  type CodmMatchKey = typeof CODM_MATCH_KEYS[number];
  type CodmMatchStats = { wins: number; placement: number; kills: number; points: number };
  type CodmRow = { id: string; team: string; matches: Record<CodmMatchKey, CodmMatchStats> };

  const createEmptyCodmMatch = (): CodmMatchStats => ({ wins: 0, placement: 0, kills: 0, points: 0 });
  const createEmptyCodmMatches = (): Record<CodmMatchKey, CodmMatchStats> => ({
    match1: createEmptyCodmMatch(),
    match2: createEmptyCodmMatch(),
    match3: createEmptyCodmMatch(),
  });

  const [codmRows, setCodmRows] = useState<CodmRow[]>(() =>
    Array.from({ length: 14 }, (_, i) => ({ id: `${i}`, team: `Team ${i + 1}`, matches: createEmptyCodmMatches() }))
  );

  const updateCodmTeamName = (rowId: string, name: string) => {
    setCodmRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, team: name } : r)));
    setIsDirty(true);
  };

  const updateCodmStat = useCallback(
    (rowId: string, matchKey: CodmMatchKey, field: "wins" | "placement" | "kills", value: string) => {
      const n = Number(value);
      const v = Number.isFinite(n) ? n : 0;
      setCodmRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          const m = r.matches[matchKey];
          const updated = { ...m, [field]: v } as CodmMatchStats;
          updated.points = (field === "placement" ? v : m.placement) + (field === "kills" ? v : m.kills);
          return { ...r, matches: { ...r.matches, [matchKey]: updated } };
        })
      );
      setIsDirty(true);
    },
    [setCodmRows, setIsDirty]
  );

  const codmOverall = useMemo(() => {
    const rows = codmRows
      .map((r) => {
        const totals = CODM_MATCH_KEYS.reduce(
          (acc, mk) => {
            const m = r.matches[mk];
            acc.wins += m.wins || 0;
            acc.placement += m.placement || 0;
            acc.kills += m.kills || 0;
            return acc;
          },
          { wins: 0, placement: 0, kills: 0 }
        );
        const totalPoints = totals.placement + totals.kills;
        return { id: r.id, team: r.team, totalWins: totals.wins, totalPlacement: totals.placement, totalKills: totals.kills, totalPoints };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
    return rows.map((r, i) => ({ rank: i + 1, ...r }));
  }, [codmRows]);

  const [codmBracket, setCodmBracket] = useState<Bracket | null>(null);

  const buildCodmBracketFromOverall = (teams: string[]): Bracket => {
    const seeds = teams.slice(0, 8);
    const qf = [
      { teamA: seeds[0] ?? "—", teamB: seeds[7] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" as const },
      { teamA: seeds[1] ?? "—", teamB: seeds[6] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" as const },
      { teamA: seeds[2] ?? "—", teamB: seeds[5] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" as const },
      { teamA: seeds[3] ?? "—", teamB: seeds[4] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" as const },
    ];
    const sf = [
      { teamA: "Winner M1", teamB: "Winner M4", scoreA: 0, scoreB: 0, status: "upcoming" as const },
      { teamA: "Winner M2", teamB: "Winner M3", scoreA: 0, scoreB: 0, status: "upcoming" as const },
    ];
    const gf = [{ teamA: "Winner SF1", teamB: "Winner SF2", scoreA: 0, scoreB: 0, status: "upcoming" as const }];
    return {
      columns: [
        { title: "Quarterfinals", matches: qf },
        { title: "Semifinals", matches: sf },
        { title: "Grand Final", matches: gf },
      ],
    } as Bracket;
  };

  useEffect(() => {
    if (gameId !== "codm") return;
    if (!codmBracket) {
      setCodmBracket(buildCodmBracketFromOverall(codmOverall.map((r) => r.team)));
    }
  }, [gameId, codmBracket, codmOverall]);

  const handleCodmScoreChange = (col: number, mIdx: number, newA: number, newB: number) => {
    setCodmBracket((prev) => {
      if (!prev) return prev;
      const next = { ...prev, columns: prev.columns.map((c) => ({ ...c, matches: c.matches.map((m) => ({ ...m })) })) } as Bracket;
      next.columns[col].matches[mIdx].scoreA = newA;
      next.columns[col].matches[mIdx].scoreB = newB;
      if (newA !== newB) next.columns[col].matches[mIdx].status = "completed";
      const match = next.columns[col].matches[mIdx];
      if (match.scoreA !== match.scoreB) {
        const winner = match.scoreA > match.scoreB ? match.teamA : match.teamB;
        if (col === 0) {
          if (mIdx === 0) (next.columns[1].matches[0] as any).teamA = winner;
          if (mIdx === 3) (next.columns[1].matches[0] as any).teamB = winner;
          if (mIdx === 1) (next.columns[1].matches[1] as any).teamA = winner;
          if (mIdx === 2) (next.columns[1].matches[1] as any).teamB = winner;
        }
        if (col === 1) {
          if (mIdx === 0) (next.columns[2].matches[0] as any).teamA = winner;
          if (mIdx === 1) (next.columns[2].matches[0] as any).teamB = winner;
        }
        if (col === 2) {
          const gfMatch = next.columns[2].matches[0];
          (next as any).winner = gfMatch.scoreA > gfMatch.scoreB ? gfMatch.teamA : gfMatch.teamB;
        }
      }
      return next;
    });
    setIsDirty(true);
  };

  const selectedGame = useMemo(() => {
    if (!event) return undefined;
    return gameId ? event.games.find((g) => g.id === gameId) : undefined;
  }, [event, gameId]);

  if (!event) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="font-orbitron">Event not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/events")}>Back to Events</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [activeGroup, setActiveGroup] = useState<string>("overall");

  const [canEdit, setCanEdit] = useState<boolean>(false);
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      let ok = isAuthed();
      try {
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email;
        const allowedEmail = (import.meta as any).env.VITE_ADMIN_EMAIL as string | undefined;
        if (data.session && (!allowedEmail || email === allowedEmail)) ok = true;
      } catch {}
      if (mounted) setCanEdit(ok && eventId === "lock-load");
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const allowedEmail = (import.meta as any).env.VITE_ADMIN_EMAIL as string | undefined;
      const email = session?.user?.email;
      setCanEdit((isAuthed() || (!!session && (!allowedEmail || email === allowedEmail))) && eventId === "lock-load");
    });
    return () => {
      mounted = false;
      try { sub.subscription.unsubscribe(); } catch {}
    };
  }, []);

  const renderFreefireStatCell = (
    group: GroupLetter,
    originalIndex: number,
    matchKey: FreeFireMatchKey,
    field: "booyah" | "placement" | "kills",
    value: number
  ) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    if (!canEdit) {
      return safeValue;
    }

    return (
      <Input
        type="number"
        className="text-right"
        value={safeValue}
        onChange={(e) => updateFreefireMatchStat(group, originalIndex, matchKey, field, e.target.value)}
      />
    );
  };

  // BGMI Points Table: per-match editable data and overall aggregation
  type MatchRow = { team: string; wwcd: number; placement: number; kills: number; total: number };
  const matchKeys = ["match1", "match2", "match3", "match4", "match5", "match6"] as const;
  type MatchKey = typeof matchKeys[number];

  const teamNames = useMemo(() => Array.from({ length: 31 }, (_, i) => `Team ${i + 1}`), []);
  const initialRows: MatchRow[] = useMemo(() => teamNames.map((t) => ({ team: t, wwcd: 0, placement: 0, kills: 0, total: 0 })), [teamNames]);
  const createMatchTemplate = useCallback(
    () =>
      matchKeys.reduce((acc, key) => {
        acc[key] = initialRows.map((row) => ({ ...row }));
        return acc;
      }, {} as Record<MatchKey, MatchRow[]>),
    [initialRows]
  );

  const [matchData, setMatchData] = useState<Record<MatchKey, MatchRow[]>>(() => createMatchTemplate());

  const getTeamName = useCallback((origIdx: number) => matchData[matchKeys[0]][origIdx]?.team ?? `Team ${origIdx + 1}` , [matchData]);
  const updateTeamName = (origIdx: number, name: string) => {
    setMatchData((prev) => {
      const next: typeof prev = { ...prev };
      for (const key of matchKeys) {
        const rows = next[key].slice();
        const row = { ...rows[origIdx] };
        row.team = name;
        rows[origIdx] = row;
        next[key] = rows;
      }
      return next;
    });
    setFinalsRows((prev) => prev.map((r) => (r.origIdx === origIdx ? { ...r, team: name } : r)));
    setIsDirty(true);
  };

  const updateCell = (m: MatchKey, i: number, key: keyof MatchRow, value: string) => {
    setMatchData((prev) => {
      const next = { ...prev };
      const rows = [...next[m]];
      const row = { ...rows[i] };
      if (key === "wwcd" || key === "placement" || key === "kills") {
        (row as any)[key] = Number(value) || 0;
        row.total = (row.placement || 0) + (row.kills || 0);
      } else if (key === "team") {
        row.team = value;
      }
      rows[i] = row;
      next[m] = rows;
      return next;
    });
    setIsDirty(true);
  };

  const GROUPS = { A: [0, 7], B: [8, 15], C: [16, 23], D: [24, 30] } as const;
  type GroupKey = keyof typeof GROUPS;
  const indicesForGroups = (...groups: GroupKey[]) =>
    groups.flatMap((g) => {
      const [s, e] = GROUPS[g];
      return Array.from({ length: e - s + 1 }, (_, i) => s + i);
    });
  const indicesForMatch = (mk: MatchKey): number[] => {
    switch (mk) {
      case "match1":
        return indicesForGroups("A", "B");
      case "match2":
        return indicesForGroups("C", "D");
      case "match3":
        return indicesForGroups("A", "C");
      case "match4":
        return indicesForGroups("B", "D");
      case "match5":
        return indicesForGroups("A", "D");
      case "match6":
        return indicesForGroups("B", "C");
      default:
        return teamNames.map((_, i) => i);
    }
  };

  const groupLetterForIndex = (idx: number): "A" | "B" | "C" | "D" => {
    if (idx >= GROUPS.A[0] && idx <= GROUPS.A[1]) return "A";
    if (idx >= GROUPS.B[0] && idx <= GROUPS.B[1]) return "B";
    if (idx >= GROUPS.C[0] && idx <= GROUPS.C[1]) return "C";
    return "D";
  };

  const overallRows = useMemo(() => {
    const aggregated = teamNames.map((_, idx) => {
      const team = matchData[matchKeys[0]][idx]?.team ?? `Team ${idx + 1}`;
      let wwcd = 0, placement = 0, kills = 0, total = 0;
      for (const mk of matchKeys) {
        const r = matchData[mk][idx];
        wwcd += r?.wwcd ?? 0;
        placement += r?.placement ?? 0;
        kills += r?.kills ?? 0;
        total += (r?.placement ?? 0) + (r?.kills ?? 0);
      }
      return { team, wwcd, placement, kills, total, origIdx: idx };
    });
    aggregated.sort((a, b) => b.total - a.total);
    return aggregated.map((row, i) => ({ rank: i + 1, ...row }));
  }, [matchData, teamNames]);

  const overallTotalsByIndex = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of overallRows) map.set(row.origIdx, row.total);
    return map;
  }, [overallRows]);

  type FinalsRow = {
    origIdx: number;
    team: string;
    wwcd: number;
    placement: number;
    kills: number;
    total: number;
  };

  const [finalsRows, setFinalsRows] = useState<FinalsRow[]>([]);

  const updateMlTeamName = (group: GroupLetter, origIdx: number, name: string) => {
    setMlGroupData((prev) => {
      const next = { ...prev };
      const rows = next[group] ? [...next[group]] : [];
      const existing = rows[origIdx] ?? { rank: origIdx + 1, team: `Team ${origIdx + 1}`, points: 0, originalIndex: origIdx };
      rows[origIdx] = { ...existing, team: name };
      next[group] = rows;
      return next;
    });
    setIsDirty(true);
  };

  const updateMlPoints = (group: GroupLetter, origIdx: number, value: string) => {
    const points = Number(value) || 0;
    setMlGroupData((prev) => {
      const next = { ...prev };
      const rows = next[group] ? [...next[group]] : [];
      const existing = rows[origIdx] ?? { rank: origIdx + 1, team: `Team ${origIdx + 1}`, points: 0, originalIndex: origIdx };
      rows[origIdx] = { ...existing, points };
      next[group] = rows;
      return next;
    });
    setIsDirty(true);
  };

  const updateMlStat = (group: GroupLetter, origIdx: number, key: MobileLegendsStatKey, value: string) => {
    const numericValue = Number(value);
    setMlGroupData((prev) => {
      const next = { ...prev };
      const rows = next[group] ? [...next[group]] : [];
      const existing = rows[origIdx] ?? { rank: origIdx + 1, team: `Team ${origIdx + 1}`, points: 0, originalIndex: origIdx };
      rows[origIdx] = {
        ...existing,
        [key]: Number.isFinite(numericValue) ? numericValue : 0,
      };
      next[group] = rows;
      return next;
    });
    setIsDirty(true);
  };

  useEffect(() => {
    setFinalsRows((prev) => {
      const topTeams = overallRows.slice(0, 16);
      const next = topTeams.map((row) => {
        const existing = prev.find((p) => p.origIdx === row.origIdx);
        if (existing) {
          return { ...existing, team: row.team };
        }
        return { origIdx: row.origIdx, team: row.team, wwcd: 0, placement: 0, kills: 0, total: 0 };
      });
      return next;
    });
  }, [overallRows]);

  useEffect(() => {
    if (gameId !== "ml") return;
    if (!isSupabaseConfigured()) {
      setMlGroupData(cloneGroupRows(mobileLegendsGroupData));
      setLastSavedAt(null);
      setIsDirty(false);
      return;
    }

    let cancelled = false;

    const loadMobileLegends = async () => {
      setLoadingPoints(true);
      try {
        const snapshot = await fetchPointsSnapshot<string>(eventId, gameId);
        if (cancelled) return;

        if (snapshot?.groups) {
          const base = cloneGroupRows(mobileLegendsGroupData);
          for (const letter of GROUP_LETTERS) {
            const savedRows = snapshot.groups?.[letter];
            if (savedRows && savedRows.length > 0) {
              base[letter] = savedRows.map((row, index) => ({
                rank: typeof row.rank === "number" ? row.rank : index + 1,
                team: row.team ?? base[letter][index]?.team ?? `Team ${index + 1}`,
                points: typeof row.points === "number" ? row.points : base[letter][index]?.points ?? 0,
                gamesPlayed: typeof row.gamesPlayed === "number" ? row.gamesPlayed : undefined,
                gamesWon: typeof row.gamesWon === "number" ? row.gamesWon : undefined,
                originalIndex: row.originalIndex ?? index,
              }));
            }
          }
          setMlGroupData(cloneGroupRows(base));
          try {
            const snapAny = snapshot as any;
            if (snapAny?.bracket?.columns) {
              setMlBracket(snapAny.bracket as Bracket);
            } else {
              setMlBracket(buildMlBracketFromGroups());
            }
          } catch {
            setMlBracket(buildMlBracketFromGroups());
          }
          setLastSavedAt(snapshot.updatedAt ?? null);
        } else {
          setMlGroupData(cloneGroupRows(mobileLegendsGroupData));
          setMlBracket(buildMlBracketFromGroups());
          setLastSavedAt(snapshot?.updatedAt ?? null);
        }
        setIsDirty(false);
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load saved leaderboard");
          console.error(error);
        }
      } finally {
        if (!cancelled) {
          setLoadingPoints(false);
        }
      }
    };

    loadMobileLegends();

    return () => {
      cancelled = true;
    };
  }, [eventId, gameId]);

  useEffect(() => {
    if (gameId !== "bgmi") return;
    if (!isSupabaseConfigured()) {
      setLastSavedAt(null);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoadingPoints(true);
      try {
        const snapshot = await fetchPointsSnapshot<MatchKey>(eventId, gameId);
        if (cancelled) return;

        if (!snapshot) {
          setMatchData(createMatchTemplate());
          setFinalsRows([]);
          setLastSavedAt(null);
          setIsDirty(false);
          return;
        }

        if (snapshot.matchData) {
          const next = createMatchTemplate();
          for (const key of matchKeys) {
            const savedRows = snapshot.matchData?.[key] ?? [];
            next[key] = initialRows.map((row, index) => {
              const saved = savedRows[index];
              const placement = Number(saved?.placement ?? 0);
              const kills = Number(saved?.kills ?? 0);
              return {
                team: saved?.team ?? row.team,
                wwcd: Number(saved?.wwcd ?? 0),
                placement,
                kills,
                total: placement + kills,
              };
            });
          }
          setMatchData(next);
        } else {
          setMatchData(createMatchTemplate());
        }

        if (snapshot.finals && snapshot.finals.length > 0) {
          setFinalsRows(
            snapshot.finals.slice(0, 16).map((row) => {
              const placement = Number(row.placement ?? 0);
              const kills = Number(row.kills ?? 0);
              return {
                origIdx: row.origIdx,
                team: row.team ?? teamNames[row.origIdx] ?? `Team ${row.origIdx + 1}`,
                wwcd: Number(row.wwcd ?? 0),
                placement,
                kills,
                total: Number(row.total ?? placement + kills),
              };
            })
          );
        } else {
          setFinalsRows([]);
        }

        setLastSavedAt(snapshot.updatedAt ?? null);
        setIsDirty(false);
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load saved leaderboard");
          console.error(error);
        }
      } finally {
        if (!cancelled) {
          setLoadingPoints(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [createMatchTemplate, eventId, gameId, initialRows, teamNames]);

  // Load Free Fire saved groups if configured
  useEffect(() => {
    if (gameId !== 'freefire') return;
    if (!isSupabaseConfigured()) {
      setLastSavedAt(null);
      setIsDirty(false);
      return;
    }

    let cancelled = false;
    const loadFreefire = async () => {
      setLoadingPoints(true);
      try {
        const snapshot = await fetchPointsSnapshot<string>(eventId, gameId);
        if (cancelled) return;
        if (snapshot?.groups) {
          const g = snapshot.groups as Record<string, any[]>;
          const mapped = {} as FreeFireGroupState;
          (['A','B','C','D'] as GroupLetter[]).forEach((letter) => {
            const arr = g[letter] ?? [];
            mapped[letter] = arr.map((r: any, idx: number) => ({
              rank: r.rank ?? idx + 1,
              team: r.team ?? `Team ${idx+1}`,
              gamesPlayed: typeof r.gamesPlayed === 'number' ? r.gamesPlayed : Number(r.gamesPlayed) || 0,
              booyah: typeof r.booyah === 'number' ? r.booyah : Number(r.booyah) || 0,
              placement: typeof r.placement === 'number' ? r.placement : Number(r.placement) || 0,
              kills: typeof r.kills === 'number' ? r.kills : Number(r.kills) || 0,
              points: typeof r.points === 'number' ? r.points : Number(r.points) || 0,
              matches: r.matches ?? { match1: { placement: 0, kills: 0 }, match2: { placement: 0, kills: 0 } },
              originalIndex: r.originalIndex ?? idx,
            }));
          });
          setFreefireGroups((prev) => ({ ...prev, ...mapped }));

          // If the snapshot did not include explicit semifinals, build them from the loaded groups
          const savedSemis = (snapshot as any)?.semifinals as any[] | undefined;
          if (savedSemis && Array.isArray(savedSemis) && savedSemis.length > 0) {
            setSemifinalRows(savedSemis.map((r: any, i: number) => normalizeSemifinalRow(r, (r?.group as GroupLetter) ?? 'A', typeof r?.seedIndex === 'number' ? r.seedIndex : i)));
          } else {
            setSemifinalRows(buildSemifinalRowsFromGroups(mapped));
          }
        } else {
          const savedSemis = (snapshot as any)?.semifinals as any[] | undefined;
          if (savedSemis && Array.isArray(savedSemis) && savedSemis.length > 0) {
            setSemifinalRows(savedSemis.map((r: any, i: number) => normalizeSemifinalRow(r, (r?.group as GroupLetter) ?? 'A', typeof r?.seedIndex === 'number' ? r.seedIndex : i)));
          }
        }
        setLastSavedAt(snapshot.updatedAt ?? null);
      } catch (e) {
        toast.error('Failed to load saved Free Fire points');
        console.error(e);
      } finally {
        if (!cancelled) setLoadingPoints(false);
      }
    };

    loadFreefire();
    return () => { cancelled = true; };
  }, [eventId, gameId]);

  useEffect(() => {
    if (gameId !== "codm") return;
    if (!isSupabaseConfigured()) {
      setLastSavedAt(null);
      setIsDirty(false);
      return;
    }
    let cancelled = false;
    const loadCodm = async () => {
      setLoadingPoints(true);
      try {
        const snapshot = await fetchPointsSnapshot<string>(eventId, gameId);
        if (cancelled) return;
        const rows: any[] = (snapshot as any)?.codmRows ?? [];
        if (rows && rows.length > 0) {
          setCodmRows(
            rows.map((r: any, idx: number) => ({
              id: r.id ?? `${idx}`,
              team: r.team ?? `Team ${idx + 1}`,
              matches: {
                match1: {
                  wins: Number(r?.matches?.match1?.wins ?? 0) || 0,
                  placement: Number(r?.matches?.match1?.placement ?? 0) || 0,
                  kills: Number(r?.matches?.match1?.kills ?? 0) || 0,
                  points: Number(r?.matches?.match1?.points ?? 0) || 0,
                },
                match2: {
                  wins: Number(r?.matches?.match2?.wins ?? 0) || 0,
                  placement: Number(r?.matches?.match2?.placement ?? 0) || 0,
                  kills: Number(r?.matches?.match2?.kills ?? 0) || 0,
                  points: Number(r?.matches?.match2?.points ?? 0) || 0,
                },
                match3: {
                  wins: Number(r?.matches?.match3?.wins ?? 0) || 0,
                  placement: Number(r?.matches?.match3?.placement ?? 0) || 0,
                  kills: Number(r?.matches?.match3?.kills ?? 0) || 0,
                  points: Number(r?.matches?.match3?.points ?? 0) || 0,
                },
              },
            }))
          );
        }
        const savedBracket = (snapshot as any)?.codmBracket as Bracket | undefined;
        if (savedBracket && savedBracket.columns) {
          setCodmBracket(savedBracket);
        } else {
          setCodmBracket(buildCodmBracketFromOverall(codmOverall.map((r) => r.team)));
        }
        setLastSavedAt(snapshot?.updatedAt ?? null);
        setIsDirty(false);
      } catch (e) {
        toast.error("Failed to load CODM leaderboard");
        console.error(e);
      } finally {
        if (!cancelled) setLoadingPoints(false);
      }
    };
    loadCodm();
    return () => {
      cancelled = true;
    };
  }, [eventId, gameId]);

  const finalsDisplayRows = useMemo(() => {
    return [...finalsRows]
      .sort((a, b) => b.total - a.total)
      .map((row, index) => ({ rank: index + 1, ...row }));
  }, [finalsRows]);

  const saveAllPoints = async () => {
    try {
      setSavingPoints(true);
      if (gameId === "bgmi") {
        const payload = {
          matchData,
          finals: finalsRows.map((r) => ({ origIdx: r.origIdx, team: r.team, wwcd: r.wwcd, placement: r.placement, kills: r.kills, total: r.total })),
        };
        await savePointsSnapshot(eventId, gameId, payload);
      } else if (gameId === "ml") {
        const payload = { groups: mlGroupData, bracket: mlBracket ?? buildMlBracketFromGroups() } as any;
        await savePointsSnapshot(eventId, gameId, payload);
      } else if (gameId === 'freefire') {
        // Rebuild semifinals from current group data so top-3 from each group are promoted
        const semis = buildSemifinalRowsFromGroups(freefireGroups);
        // Update local state so UI reflects the promotion immediately
        setSemifinalRows(semis);
        const payload = { groups: freefireGroups, semifinals: semis } as any;
        await savePointsSnapshot(eventId, gameId, payload);
      } else if (gameId === 'codm') {
        const payload = { codmRows, codmBracket } as any;
        await savePointsSnapshot(eventId, gameId, payload);
      } else {
        return;
      }
      const now = new Date().toISOString();
      setLastSavedAt(now);
      setIsDirty(false);
      toast.success("Points saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save points");
    } finally {
      setSavingPoints(false);
    }
  };

  const updateFinalsCell = (origIdx: number, key: "wwcd" | "placement" | "kills", value: string) => {
    setFinalsRows((prev) =>
      prev.map((row) => {
        if (row.origIdx !== origIdx) return row;
        const numericValue = Number(value) || 0;
        const updated = { ...row, [key]: numericValue } as FinalsRow;
        updated.total = (updated.placement || 0) + (updated.kills || 0);
        return updated;
      })
    );
    setIsDirty(true);
  };

  const renderTable = () => {
    if (!selectedGame) return null;

    const isMobileLegends = gameId === "ml";
    const showGroupTotalPoints = !isMobileLegends;



    return (
      <div>
        <Tabs defaultValue={"knockout"}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full justify-start sm:w-auto">
              <TabsTrigger value="knockout">Knockout Stage</TabsTrigger>
              {gameId === 'freefire' ? (
                <>
                  <TabsTrigger value="semifinals">Semifinals</TabsTrigger>
                  <TabsTrigger value="groupstage">Finals</TabsTrigger>
                </>
              ) : gameId === 'bgmi' ? (
                <TabsTrigger value="groupstage">Finals</TabsTrigger>
              ) : (
                <TabsTrigger value="pointrush">{gameId === 'codm' ? 'Playoffs' : 'Double Elimination'}</TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="knockout">
            {gameId === 'codm' ? (
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="font-orbitron text-2xl">COD Mobile — Preliminary Round</CardTitle>
                    {canEdit && (
                      <div className="flex items-center gap-3 text-sm">
                        {isSupabaseConfigured() ? (
                          <>
                            <div className="text-muted-foreground">
                              {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                              {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                            </div>
                            <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveAllPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                          </>
                        ) : (
                          <div className="text-red-500">Supabase not configured</div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Tabs defaultValue="overall">
                      <TabsList className="w-full">
                        <TabsTrigger value="overall">Overall</TabsTrigger>
                        <TabsTrigger value="match1">Match 1</TabsTrigger>
                        <TabsTrigger value="match2">Match 2</TabsTrigger>
                        <TabsTrigger value="match3">Match 3</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overall">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50">
                              <TableHead className="font-orbitron">#</TableHead>
                              <TableHead className="font-orbitron">Team</TableHead>
                              <TableHead className="font-orbitron text-right">Wins</TableHead>
                              <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                              <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                              <TableHead className="font-orbitron text-right">Total Points</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {codmOverall.map((row) => (
                              <TableRow key={`codm-overall-${row.id}`} className="border-border/50">
                                <TableCell className="font-semibold">{row.rank}.</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{row.team.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                                    {canEdit ? (
                                      <Input value={row.team} onChange={(e)=>updateCodmTeamName(row.id, e.target.value)} />
                                    ) : (
                                      <div>{row.team}</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{row.totalWins}</TableCell>
                                <TableCell className="text-right">{row.totalPlacement}</TableCell>
                                <TableCell className="text-right">{row.totalKills}</TableCell>
                                <TableCell className="text-right font-semibold">{row.totalPoints}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="text-xs text-muted-foreground mt-2">Top 8 teams advance to the Quarter-Finals based on total points.</div>
                      </TabsContent>

                      {["match1","match2","match3"].map((mk) => (
                        <TabsContent key={mk} value={mk}>
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border/50">
                                <TableHead className="font-orbitron">#</TableHead>
                                <TableHead className="font-orbitron">Team</TableHead>
                                <TableHead className="font-orbitron text-right">Wins</TableHead>
                                <TableHead className="font-orbitron text-right">Placement</TableHead>
                                <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                <TableHead className="font-orbitron text-right">Points</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {codmRows.map((r, i) => {
                                const m = r.matches[mk as any] as any;
                                return (
                                  <TableRow key={`codm-${mk}-${r.id}`} className="border-border/50">
                                    <TableCell className="font-semibold">{i + 1}.</TableCell>
                                    <TableCell>{r.team}</TableCell>
                                    <TableCell className="text-right">{canEdit ? (<Input className="text-right" type="number" value={m.wins} onChange={(e)=>updateCodmStat(r.id, mk as any, 'wins', e.target.value)} />) : m.wins}</TableCell>
                                    <TableCell className="text-right">{canEdit ? (<Input className="text-right" type="number" value={m.placement} onChange={(e)=>updateCodmStat(r.id, mk as any, 'placement', e.target.value)} />) : m.placement}</TableCell>
                                    <TableCell className="text-right">{canEdit ? (<Input className="text-right" type="number" value={m.kills} onChange={(e)=>updateCodmStat(r.id, mk as any, 'kills', e.target.value)} />) : m.kills}</TableCell>
                                    <TableCell className="text-right">{(m.placement||0)+(m.kills||0)}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TabsContent>
                      ))}

                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            ) : (
            <div>
              <Tabs defaultValue="group-a">
                <div className="overflow-x-auto pb-2">
                  <TabsList className="w-full justify-start sm:w-auto">
                    <TabsTrigger value="group-a">Group A</TabsTrigger>
                    <TabsTrigger value="group-b">Group B</TabsTrigger>
                    {gameId !== 'valorant' && (
                      <>
                        <TabsTrigger value="group-c">Group C</TabsTrigger>
                        <TabsTrigger value="group-d">Group D</TabsTrigger>
                      </>
                    )}
                    {gameId === 'bgmi' && <TabsTrigger value="points-table">Points Table</TabsTrigger>}
                  </TabsList>
                </div>

                <TabsContent value="group-a">
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="font-orbitron text-2xl">{selectedGame.name} — Group A</CardTitle>
                        {canEdit && (gameId === 'bgmi' || gameId === 'ml' || gameId === 'freefire') && (
                          <div className="flex items-center gap-3 text-sm">
                            {isSupabaseConfigured() ? (
                              <>
                                <div className="text-muted-foreground">
                                  {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                                  {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                                </div>
                                <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveAllPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                              </>
                            ) : (
                              <div className="text-red-500">Supabase not configured</div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        {gameId === 'freefire' ? (
                          <Tabs defaultValue="overall">
                            <TabsList className="w-full">
                              <TabsTrigger value="overall">Overall</TabsTrigger>
                              <TabsTrigger value="match1">Match 1</TabsTrigger>
                              <TabsTrigger value="match2">Match 2</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overall">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    {showGroupTotalPoints && (
                                      <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                    )}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getSortedGroupRows('A', freefireGroups).map((row, idx) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const displayRank = idx + 1;
                                    const totalBooyah = row.totalBooyah;
                                    const totalPlacement = row.totalPlacement;
                                    const totalKills = row.totalKills;
                                    const totalPoints = row.totalPoints;
                                    return (
                                      <TableRow key={`freefire-a-${origIdx}`} className="border-border/50">
                                        <TableCell className="font-semibold">{displayRank}.</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">A</div>
                                            {canEdit ? (
                                              <Input value={row.team} onChange={(e) => { const v = e.target.value; setFreefireGroups(prev => ({ ...prev, A: prev.A.map((r,i) => i === origIdx ? { ...r, team: v } : r) })); setIsDirty(true); }} />
                                            ) : (
                                              <div>{row.team}</div>
                                            )}
                                          </div>
                                        </TableCell>

                                        <TableCell className="text-right">{totalBooyah}</TableCell>
                                        <TableCell className="text-right">{totalPlacement}</TableCell>
                                        <TableCell className="text-right">{totalKills}</TableCell>
                                        {showGroupTotalPoints && (
                                          <TableCell className="text-right font-semibold">{totalPoints}</TableCell>
                                        )}
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            <TabsContent value="match1">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    <TableHead className="font-orbitron text-right">Points</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {freefireGroups['A'].map((row) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const m = row.matches?.match1 ?? { gamesPlayed:0, booyah:0, placement: 0, kills: 0, points:0 };
                                    return (
                                      <TableRow key={`freefire-a-m1-${row.rank}`} className="border-border/50">
                                        <TableCell className="font-semibold">{row.rank}.</TableCell>
                                        <TableCell>
                                          <div>{row.team}</div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('A', origIdx, 'match1', 'booyah', m.booyah ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('A', origIdx, 'match1', 'placement', m.placement ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('A', origIdx, 'match1', 'kills', m.kills ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            <TabsContent value="match2">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    <TableHead className="font-orbitron text-right">Points</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {freefireGroups['A'].map((row) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const m = row.matches?.match2 ?? { gamesPlayed:0, booyah:0, placement: 0, kills: 0, points:0 };
                                    return (
                                      <TableRow key={`freefire-a-m2-${row.rank}`} className="border-border/50">
                                        <TableCell className="font-semibold">{row.rank}.</TableCell>
                                        <TableCell>
                                          <div>{row.team}</div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('A', origIdx, 'match2', 'booyah', m.booyah ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('A', origIdx, 'match2', 'placement', m.placement ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('A', origIdx, 'match2', 'kills', m.kills ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border/50">
                                <TableHead className="font-orbitron">#</TableHead>
                                <TableHead className="font-orbitron">Team</TableHead>
                                {gameId === 'bgmi' ? (
                                  <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                ) : (
                                  <>
                                    <TableHead className="font-orbitron text-right">Games Played</TableHead>
                                    <TableHead className="font-orbitron text-right">{(gameId === 'freefire' || gameId === 'bgmi') ? 'Booyah!' : 'Games Won'}</TableHead>
                                    {(gameId === 'freefire' || gameId === 'bgmi') && (
                                      <>
                                        <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                        <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                      </>
                                    )}
                                    {showGroupTotalPoints && (
                                      <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                    )}
                                  </>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {gameId === 'bgmi' ? (
                                indicesForGroups('A').map((origIdx, i) => (
                                  <TableRow key={`group-a-${origIdx}`} className="border-border/50">
                                    <TableCell className="font-semibold">{i + 1}.</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">A</div>
                                        {canEdit ? (
                                          <Input value={getTeamName(origIdx)} onChange={(e) => updateTeamName(origIdx, e.target.value)} />
                                        ) : (
                                          <div>{getTeamName(origIdx)}</div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">{overallTotalsByIndex.get(origIdx) ?? 0}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                getGroupRowsForGame(gameId, "A", mlGroupData).map((row) => {
                                  const { gamesPlayed, gamesWon } = deriveGroupRowStats(row);
                                  const origIdx = row.originalIndex ?? row.rank - 1;
                                  const avatar = "A";
                                  const storedRow = mlGroupData['A']?.[origIdx];
                                  const displayTeam = storedRow?.team ?? row.team;
                                  const displayGamesPlayed = storedRow?.gamesPlayed ?? gamesPlayed;
                                  const displayGamesWon = storedRow?.gamesWon ?? gamesWon;


                                  return (
                                    <TableRow key={`group-a-${row.rank}`} className="border-border/50">
                                      <TableCell className="font-semibold">{row.rank}.</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{avatar}</div>
                                          {isMobileLegends && canEdit ? (
                                            <Input value={displayTeam} onChange={(e) => updateMlTeamName('A', origIdx, e.target.value)} />
                                          ) : (
                                            <div>{displayTeam}</div>
                                          )}
                                        </div>
                                      </TableCell>
                                      <>
                                        <TableCell className="text-right">
                                          {isMobileLegends && canEdit ? (
                                            <Input className="text-right" type="number" value={displayGamesPlayed} onChange={(e) => updateMlStat('A', origIdx, 'gamesPlayed', e.target.value)} />
                                          ) : (
                                            displayGamesPlayed
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {isMobileLegends && canEdit ? (
                                            <Input className="text-right" type="number" value={displayGamesWon} onChange={(e) => updateMlStat('A', origIdx, 'gamesWon', e.target.value)} />
                                          ) : (
                                            displayGamesWon
                                          )}
                                        </TableCell>
                                        {showGroupTotalPoints && (
                                          <TableCell className="text-right font-semibold">
                                            {isMobileLegends && canEdit ? (
                                              <Input className="text-right" type="number" value={mlGroupData['A']?.[origIdx]?.points ?? row.points} onChange={(e) => updateMlPoints('A', origIdx, e.target.value)} />
                                            ) : (
                                              row.points
                                            )}
                                          </TableCell>
                                        )}
                                      </>
                                    </TableRow>
                                  );
                                })
                              )}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="group-b">
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="font-orbitron text-2xl">{selectedGame.name} — Group B</CardTitle>
                        {canEdit && (gameId === 'bgmi' || gameId === 'ml' || gameId === 'freefire') && (
                          <div className="flex items-center gap-3 text-sm">
                            {isSupabaseConfigured() ? (
                              <>
                                <div className="text-muted-foreground">
                                  {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                                  {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                                </div>
                                <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveAllPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                              </>
                            ) : (
                              <div className="text-red-500">Supabase not configured</div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        {gameId === 'freefire' ? (
                          <Tabs defaultValue="overall">
                            <TabsList className="w-full">
                              <TabsTrigger value="overall">Overall</TabsTrigger>
                              <TabsTrigger value="match1">Match 1</TabsTrigger>
                              <TabsTrigger value="match2">Match 2</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overall">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    {showGroupTotalPoints && (
                                      <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                    )}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getSortedGroupRows('B', freefireGroups).map((row, idx) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const displayRank = idx + 1;
                                    const totalBooyah = row.totalBooyah;
                                    const totalPlacement = row.totalPlacement;
                                    const totalKills = row.totalKills;
                                    const totalPoints = row.totalPoints;
                                    return (
                                      <TableRow key={`freefire-b-${origIdx}`} className="border-border/50">
                                        <TableCell className="font-semibold">{displayRank}.</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">B</div>
                                            {canEdit ? (
                                              <Input value={row.team} onChange={(e) => { const v = e.target.value; setFreefireGroups((prev) => ({ ...prev, B: prev.B.map((r, i) => i === origIdx ? { ...r, team: v } : r) })); setIsDirty(true); }} />
                                            ) : (
                                              <div>{row.team}</div>
                                            )}
                                          </div>
                                        </TableCell>

                                        <TableCell className="text-right">{totalBooyah}</TableCell>
                                        <TableCell className="text-right">{totalPlacement}</TableCell>
                                        <TableCell className="text-right">{totalKills}</TableCell>
                                        {showGroupTotalPoints && (
                                          <TableCell className="text-right font-semibold">{totalPoints}</TableCell>
                                        )}
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            <TabsContent value="match1">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    <TableHead className="font-orbitron text-right">Points</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {freefireGroups['B'].map((row) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const m = row.matches?.match1 ?? { gamesPlayed: 0, booyah: 0, placement: 0, kills: 0, points: 0 };
                                    return (
                                      <TableRow key={`freefire-b-m1-${row.rank}`} className="border-border/50">
                                        <TableCell className="font-semibold">{row.rank}.</TableCell>
                                        <TableCell>
                                          <div>{row.team}</div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('B', origIdx, 'match1', 'booyah', m.booyah ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('B', origIdx, 'match1', 'placement', m.placement ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('B', origIdx, 'match1', 'kills', m.kills ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            <TabsContent value="match2">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    <TableHead className="font-orbitron text-right">Points</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {freefireGroups['B'].map((row) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const m = row.matches?.match2 ?? { gamesPlayed: 0, booyah: 0, placement: 0, kills: 0, points: 0 };
                                    return (
                                      <TableRow key={`freefire-b-m2-${row.rank}`} className="border-border/50">
                                        <TableCell className="font-semibold">{row.rank}.</TableCell>
                                        <TableCell>
                                          <div>{row.team}</div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('B', origIdx, 'match2', 'booyah', m.booyah ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('B', origIdx, 'match2', 'placement', m.placement ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('B', origIdx, 'match2', 'kills', m.kills ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border/50">
                                <TableHead className="font-orbitron">#</TableHead>
                                <TableHead className="font-orbitron">Team</TableHead>
                                {gameId === 'bgmi' ? (
                                  <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                ) : (
                                  <>
                                    <TableHead className="font-orbitron text-right">Games Played</TableHead>
                                    <TableHead className="font-orbitron text-right">{(gameId === 'freefire' || gameId === 'bgmi') ? 'Booyah!' : 'Games Won'}</TableHead>
                                    {(gameId === 'freefire' || gameId === 'bgmi') && (
                                      <>
                                        <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                        <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                      </>
                                    )}
                                    {showGroupTotalPoints && (
                                      <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                    )}
                                  </>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {gameId === 'bgmi' ? (
                                indicesForGroups('B').map((origIdx, i) => (
                                  <TableRow key={`group-b-${origIdx}`} className="border-border/50">
                                    <TableCell className="font-semibold">{i + 1}.</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">B</div>
                                        {canEdit ? (
                                          <Input value={getTeamName(origIdx)} onChange={(e) => updateTeamName(origIdx, e.target.value)} />
                                        ) : (
                                          <div>{getTeamName(origIdx)}</div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">{overallTotalsByIndex.get(origIdx) ?? 0}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                getGroupRowsForGame(gameId, "B", mlGroupData).map((row) => {
                                  const { gamesPlayed, gamesWon } = deriveGroupRowStats(row);
                                  const origIdx = row.originalIndex ?? row.rank - 1;
                                  const avatar = "B";
                                  const storedRow = mlGroupData['B']?.[origIdx];
                                  const displayTeam = storedRow?.team ?? row.team;
                                  const displayGamesPlayed = storedRow?.gamesPlayed ?? gamesPlayed;
                                  const displayGamesWon = storedRow?.gamesWon ?? gamesWon;


                                  return (
                                    <TableRow key={`group-b-${row.rank}`} className="border-border/50">
                                      <TableCell className="font-semibold">{row.rank}.</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{avatar}</div>
                                          {isMobileLegends && canEdit ? (
                                            <Input value={displayTeam} onChange={(e) => updateMlTeamName('B', origIdx, e.target.value)} />
                                          ) : (
                                            <div>{displayTeam}</div>
                                          )}
                                        </div>
                                      </TableCell>
                                      <>
                                        <TableCell className="text-right">
                                          {isMobileLegends && canEdit ? (
                                            <Input className="text-right" type="number" value={displayGamesPlayed} onChange={(e) => updateMlStat('B', origIdx, 'gamesPlayed', e.target.value)} />
                                          ) : (
                                            displayGamesPlayed
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {isMobileLegends && canEdit ? (
                                            <Input className="text-right" type="number" value={displayGamesWon} onChange={(e) => updateMlStat('B', origIdx, 'gamesWon', e.target.value)} />
                                          ) : (
                                            displayGamesWon
                                          )}
                                        </TableCell>
                                        {showGroupTotalPoints && (
                                          <TableCell className="text-right font-semibold">
                                            {isMobileLegends && canEdit ? (
                                              <Input className="text-right" type="number" value={mlGroupData['B']?.[origIdx]?.points ?? row.points} onChange={(e) => updateMlPoints('B', origIdx, e.target.value)} />
                                            ) : (
                                              row.points
                                            )}
                                          </TableCell>
                                        )}
                                      </>
                                    </TableRow>
                                  );
                                })
                              )}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

{gameId !== 'valorant' && (
                <TabsContent value="group-c">
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="font-orbitron text-2xl">{selectedGame.name} Group C</CardTitle>
                        {canEdit && (gameId === 'bgmi' || gameId === 'ml' || gameId === 'freefire') && (
                          <div className="flex items-center gap-3 text-sm">
                            {isSupabaseConfigured() ? (
                              <>
                                <div className="text-muted-foreground">
                                  {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                                  {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                                </div>
                                <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveAllPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                              </>
                            ) : (
                              <div className="text-red-500">Supabase not configured</div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        {gameId === 'freefire' ? (
                          <Tabs defaultValue="overall">
                            <TabsList className="w-full">
                              <TabsTrigger value="overall">Overall</TabsTrigger>
                              <TabsTrigger value="match1">Match 1</TabsTrigger>
                              <TabsTrigger value="match2">Match 2</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overall">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    {showGroupTotalPoints && (
                                      <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                    )}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getSortedGroupRows('C', freefireGroups).map((row, idx) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const displayRank = idx + 1;
                                    const totalBooyah = row.totalBooyah;
                                    const totalPlacement = row.totalPlacement;
                                    const totalKills = row.totalKills;
                                    const totalPoints = row.totalPoints;
                                    return (
                                      <TableRow key={`freefire-c-${origIdx}`} className="border-border/50">
                                        <TableCell className="font-semibold">{displayRank}.</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">C</div>
                                            {canEdit ? (
                                              <Input value={row.team} onChange={(e) => { const v = e.target.value; setFreefireGroups((prev) => ({ ...prev, C: prev.C.map((r, i) => i === origIdx ? { ...r, team: v } : r) })); setIsDirty(true); }} />
                                            ) : (
                                              <div>{row.team}</div>
                                            )}
                                          </div>
                                        </TableCell>

                                        <TableCell className="text-right">{totalBooyah}</TableCell>
                                        <TableCell className="text-right">{totalPlacement}</TableCell>
                                        <TableCell className="text-right">{totalKills}</TableCell>
                                        {showGroupTotalPoints && (
                                          <TableCell className="text-right font-semibold">{totalPoints}</TableCell>
                                        )}
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            <TabsContent value="match1">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    <TableHead className="font-orbitron text-right">Points</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {freefireGroups['C'].map((row) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const m = row.matches?.match1 ?? { gamesPlayed: 0, booyah: 0, placement: 0, kills: 0, points: 0 };
                                    return (
                                      <TableRow key={`freefire-c-m1-${row.rank}`} className="border-border/50">
                                        <TableCell className="font-semibold">{row.rank}.</TableCell>
                                        <TableCell>{row.team}</TableCell>

                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('C', origIdx, 'match1', 'booyah', m.booyah ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('C', origIdx, 'match1', 'placement', m.placement ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('C', origIdx, 'match1', 'kills', m.kills ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            <TabsContent value="match2">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    <TableHead className="font-orbitron text-right">Points</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {freefireGroups['C'].map((row) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const m = row.matches?.match2 ?? { gamesPlayed: 0, booyah: 0, placement: 0, kills: 0, points: 0 };
                                    return (
                                      <TableRow key={`freefire-c-m2-${row.rank}`} className="border-border/50">
                                        <TableCell className="font-semibold">{row.rank}.</TableCell>
                                        <TableCell>{row.team}</TableCell>

                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('C', origIdx, 'match2', 'booyah', m.booyah ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {renderFreefireStatCell('C', origIdx, 'match2', 'placement', m.placement ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
  {renderFreefireStatCell('C', origIdx, 'match2', 'kills', m.kills ?? 0)}
</TableCell>
                                        <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border/50">
                                <TableHead className="font-orbitron">#</TableHead>
                                <TableHead className="font-orbitron">Team</TableHead>
                                {gameId === 'bgmi' ? (
                                  <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                ) : (
                                  <>
                                    <TableHead className="font-orbitron text-right">Games Played</TableHead>
                                    <TableHead className="font-orbitron text-right">{(gameId === 'freefire' || gameId === 'bgmi') ? 'Booyah!' : 'Games Won'}</TableHead>
                                    {(gameId === 'freefire' || gameId === 'bgmi') && (
                                      <>
                                        <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                        <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                      </>
                                    )}
                                    {showGroupTotalPoints && (
                                      <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                    )}
                                  </>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {gameId === 'bgmi' ? (
                                indicesForGroups('C').map((origIdx, i) => (
                                  <TableRow key={`group-c-${origIdx}`} className="border-border/50">
                                    <TableCell className="font-semibold">{i + 1}.</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">C</div>
                                        {canEdit ? (
                                          <Input value={getTeamName(origIdx)} onChange={(e) => updateTeamName(origIdx, e.target.value)} />
                                        ) : (
                                          <div>{getTeamName(origIdx)}</div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">{overallTotalsByIndex.get(origIdx) ?? 0}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                getGroupRowsForGame(gameId, "C", mlGroupData).map((row) => {
                                  const { gamesPlayed, gamesWon } = deriveGroupRowStats(row);
                                  const origIdx = row.originalIndex ?? row.rank - 1;
                                  const avatar = "C";
                                  const storedRow = mlGroupData['C']?.[origIdx];
                                  const displayTeam = storedRow?.team ?? row.team;
                                  const displayGamesPlayed = storedRow?.gamesPlayed ?? gamesPlayed;
                                  const displayGamesWon = storedRow?.gamesWon ?? gamesWon;


                                  return (
                                    <TableRow key={`group-c-${row.rank}`} className="border-border/50">
                                      <TableCell className="font-semibold">{row.rank}.</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{avatar}</div>
                                          {isMobileLegends && canEdit ? (
                                            <Input value={displayTeam} onChange={(e) => updateMlTeamName('C', origIdx, e.target.value)} />
                                          ) : (
                                            <div>{displayTeam}</div>
                                          )}
                                        </div>
                                      </TableCell>
                                      <>
                                        <TableCell className="text-right">
                                          {isMobileLegends && canEdit ? (
                                            <Input className="text-right" type="number" value={displayGamesPlayed} onChange={(e) => updateMlStat('C', origIdx, 'gamesPlayed', e.target.value)} />
                                          ) : (
                                            displayGamesPlayed
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {isMobileLegends && canEdit ? (
                                            <Input className="text-right" type="number" value={displayGamesWon} onChange={(e) => updateMlStat('C', origIdx, 'gamesWon', e.target.value)} />
                                          ) : (
                                            displayGamesWon
                                          )}
                                        </TableCell>
                                        {showGroupTotalPoints && (
                                          <TableCell className="text-right font-semibold">
                                            {isMobileLegends && canEdit ? (
                                              <Input className="text-right" type="number" value={mlGroupData['C']?.[origIdx]?.points ?? row.points} onChange={(e) => updateMlPoints('C', origIdx, e.target.value)} />
                                            ) : (
                                              row.points
                                            )}
                                          </TableCell>
                                        )}
                                      </>
                                    </TableRow>
                                  );
                                })
                              )}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

{gameId !== 'valorant' && (
                <TabsContent value="group-d">
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="font-orbitron text-2xl">{selectedGame.name} — Group D</CardTitle>
                        {canEdit && (gameId === 'bgmi' || gameId === 'ml' || gameId === 'freefire') && (
                          <div className="flex items-center gap-3 text-sm">
                            {isSupabaseConfigured() ? (
                              <>
                                <div className="text-muted-foreground">
                                  {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                                  {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                                </div>
                                <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveAllPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                              </>
                            ) : (
                              <div className="text-red-500">Supabase not configured</div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        {gameId === 'freefire' ? (
                          <Tabs defaultValue="overall">
                            <TabsList className="w-full">
                              <TabsTrigger value="overall">Overall</TabsTrigger>
                              <TabsTrigger value="match1">Match 1</TabsTrigger>
                              <TabsTrigger value="match2">Match 2</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overall">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    {showGroupTotalPoints && (
                                      <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                    )}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getSortedGroupRows('D', freefireGroups).map((row, idx) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const displayRank = idx + 1;
                                    const totalBooyah = row.totalBooyah;
                                    const totalPlacement = row.totalPlacement;
                                    const totalKills = row.totalKills;
                                    const totalPoints = row.totalPoints;
                                    return (
                                      <TableRow key={`freefire-d-${origIdx}`} className="border-border/50">
                                        <TableCell className="font-semibold">{displayRank}.</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">D</div>
                                            {canEdit ? (
                                              <Input value={row.team} onChange={(e) => { const v = e.target.value; setFreefireGroups((prev) => ({ ...prev, D: prev.D.map((r, i) => i === origIdx ? { ...r, team: v } : r) })); setIsDirty(true); }} />
                                            ) : (
                                              <div>{row.team}</div>
                                            )}
                                          </div>
                                        </TableCell>

                                        <TableCell className="text-right">{totalBooyah}</TableCell>
                                        <TableCell className="text-right">{totalPlacement}</TableCell>
                                        <TableCell className="text-right">{totalKills}</TableCell>
                                        {showGroupTotalPoints && (
                                          <TableCell className="text-right font-semibold">{totalPoints}</TableCell>
                                        )}
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            <TabsContent value="match1">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    <TableHead className="font-orbitron text-right">Points</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {freefireGroups['D'].map((row) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const m = row.matches?.match1 ?? { gamesPlayed: 0, booyah: 0, placement: 0, kills: 0, points: 0 };
                                    return (
                                      <TableRow key={`freefire-d-m1-${row.rank}`} className="border-border/50">
                                        <TableCell className="font-semibold">{row.rank}.</TableCell>
                                        <TableCell>{row.team}</TableCell>

                                        <TableCell className="text-right">
  {renderFreefireStatCell('D', origIdx, 'match1', 'booyah', m.booyah ?? 0)}
</TableCell>
                                        <TableCell className="text-right">
  {renderFreefireStatCell('D', origIdx, 'match1', 'placement', m.placement ?? 0)}
</TableCell>
                                        <TableCell className="text-right">
  {renderFreefireStatCell('D', origIdx, 'match1', 'kills', m.kills ?? 0)}
</TableCell>
                                        <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            <TabsContent value="match2">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    <TableHead className="font-orbitron text-right">Points</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {freefireGroups['D'].map((row) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const m = row.matches?.match2 ?? { gamesPlayed: 0, booyah: 0, placement: 0, kills: 0, points: 0 };
                                    return (
                                      <TableRow key={`freefire-d-m2-${row.rank}`} className="border-border/50">
                                        <TableCell className="font-semibold">{row.rank}.</TableCell>
                                        <TableCell>{row.team}</TableCell>

                                        <TableCell className="text-right">
  {renderFreefireStatCell('D', origIdx, 'match2', 'booyah', m.booyah ?? 0)}
</TableCell>
                                        <TableCell className="text-right">
  {renderFreefireStatCell('D', origIdx, 'match2', 'placement', m.placement ?? 0)}
</TableCell>
                                        <TableCell className="text-right">
  {renderFreefireStatCell('D', origIdx, 'match2', 'kills', m.kills ?? 0)}
</TableCell>
                                        <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border/50">
                                <TableHead className="font-orbitron">#</TableHead>
                                <TableHead className="font-orbitron">Team</TableHead>
                                {gameId === 'bgmi' ? (
                                  <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                ) : (
                                  <>
                                    <TableHead className="font-orbitron text-right">Games Played</TableHead>
                                    <TableHead className="font-orbitron text-right">{(gameId === 'freefire' || gameId === 'bgmi') ? 'Booyah!' : 'Games Won'}</TableHead>
                                    {(gameId === 'freefire' || gameId === 'bgmi') && (
                                      <>
                                        <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                        <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                      </>
                                    )}
                                    {showGroupTotalPoints && (
                                      <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                    )}
                                  </>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {gameId === 'bgmi' ? (
                                indicesForGroups('D').map((origIdx, i) => (
                                  <TableRow key={`group-d-${origIdx}`} className="border-border/50">
                                    <TableCell className="font-semibold">{i + 1}.</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">D</div>
                                        {canEdit ? (
                                          <Input value={getTeamName(origIdx)} onChange={(e) => updateTeamName(origIdx, e.target.value)} />
                                        ) : (
                                          <div>{getTeamName(origIdx)}</div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">{overallTotalsByIndex.get(origIdx) ?? 0}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                getGroupRowsForGame(gameId, "D", mlGroupData).map((row) => {
                                  const { gamesPlayed, gamesWon } = deriveGroupRowStats(row);
                                  const origIdx = row.originalIndex ?? row.rank - 1;
                                  const storedRow = mlGroupData['D']?.[origIdx];
                                  const displayTeam = storedRow?.team ?? row.team;
                                  const displayGamesPlayed = storedRow?.gamesPlayed ?? gamesPlayed;
                                  const displayGamesWon = storedRow?.gamesWon ?? gamesWon;


                                  return (
                                    <TableRow key={`group-d-${row.rank}`} className="border-border/50">
                                      <TableCell className="font-semibold">{row.rank}.</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">D</div>
                                          {isMobileLegends && canEdit ? (
                                            <Input value={displayTeam} onChange={(e) => updateMlTeamName('D', origIdx, e.target.value)} />
                                          ) : (
                                            <div>{displayTeam}</div>
                                          )}
                                        </div>
                                      </TableCell>
                                      <>
                                        <TableCell className="text-right">
                                          {isMobileLegends && canEdit ? (
                                            <Input className="text-right" type="number" value={displayGamesPlayed} onChange={(e) => updateMlStat('D', origIdx, 'gamesPlayed', e.target.value)} />
                                          ) : (
                                            displayGamesPlayed
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {isMobileLegends && canEdit ? (
                                            <Input className="text-right" type="number" value={displayGamesWon} onChange={(e) => updateMlStat('D', origIdx, 'gamesWon', e.target.value)} />
                                          ) : (
                                            displayGamesWon
                                          )}
                                        </TableCell>
                                        {showGroupTotalPoints && (
                                          <TableCell className="text-right font-semibold">
                                            {isMobileLegends && canEdit ? (
                                              <Input className="text-right" type="number" value={mlGroupData['D']?.[origIdx]?.points ?? row.points} onChange={(e) => updateMlPoints('D', origIdx, e.target.value)} />
                                            ) : (
                                              row.points
                                            )}
                                          </TableCell>
                                        )}
                                      </>
                                    </TableRow>
                                  );
                                })
                              )}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {gameId === 'bgmi' && (
                <TabsContent value="points-table">
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="font-orbitron text-2xl">Points Table</CardTitle>
                        {canEdit && (
                          <div className="flex items-center gap-3 text-sm">
                            {isSupabaseConfigured() ? (
                              <>
                                <div className="text-muted-foreground">
                                  {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                                  {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                                </div>
                                <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveAllPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                              </>
                            ) : (
                              <div className="text-red-500">Supabase not configured</div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="overall">
                        <TabsList>
                          <TabsTrigger value="overall">Overall</TabsTrigger>
                          {matchKeys.map((k, i) => (
                            <TabsTrigger key={k} value={k}>{`Match ${i + 1}`}</TabsTrigger>
                          ))}
                        </TabsList>

                        <TabsContent value="overall">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-border/50">
                                  <TableHead className="font-orbitron">#</TableHead>
                                  <TableHead className="font-orbitron">Team</TableHead>
                                  <TableHead className="font-orbitron text-right">WWCD!</TableHead>
                                  <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                  <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                  <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {overallRows.map((row) => (
                                  <TableRow key={`overall-${row.rank}`} className="border-border/50">
                                    <TableCell className="font-semibold">{row.rank}.</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{groupLetterForIndex(row.origIdx)}</div>
                                        <div>{row.team}</div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">{row.wwcd}</TableCell>
                                    <TableCell className="text-right">{row.placement}</TableCell>
                                    <TableCell className="text-right">{row.kills}</TableCell>
                                    <TableCell className="text-right font-semibold">{row.total}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>

                        {matchKeys.map((mk) => (
                          <TabsContent key={mk} value={mk}>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">WWCD!</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                    <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                    <TableHead className="font-orbitron text-right">Total Points</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {indicesForMatch(mk).map((origIdx, i) => {
                                    const row = matchData[mk][origIdx];
                                    return (
                                      <TableRow key={`${mk}-${origIdx}`} className="border-border/50">
                                        <TableCell className="font-semibold">{i + 1}.</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{groupLetterForIndex(origIdx)}</div>
                                            <div>{row.team}</div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right w-28">{canEdit ? (<Input className="text-right" type="number" value={row.wwcd} onChange={(e) => updateCell(mk, origIdx, "wwcd", e.target.value)} />) : row.wwcd}</TableCell>
                                        <TableCell className="text-right w-36">{canEdit ? (<Input className="text-right" type="number" value={row.placement} onChange={(e) => updateCell(mk, origIdx, "placement", e.target.value)} />) : row.placement}</TableCell>
                                        <TableCell className="text-right w-32">{canEdit ? (<Input className="text-right" type="number" value={row.kills} onChange={(e) => updateCell(mk, origIdx, "kills", e.target.value)} />) : row.kills}</TableCell>
                                        <TableCell className="text-right w-32">{(row.placement || 0) + (row.kills || 0)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </TabsContent>
                        ))}

                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              </Tabs>
            </div>
            )}
          </TabsContent>

          {gameId === 'freefire' && (
          <TabsContent value="semifinals">
            <div>
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="font-orbitron text-2xl">{selectedGame.name} — Semifinals</CardTitle>
                    {canEdit && gameId === 'freefire' && (
                      <div className="flex items-center gap-3 text-sm">
                        {isSupabaseConfigured() ? (
                          <>
                            <div className="text-muted-foreground">
                              {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                              {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                            </div>
                            <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveAllPoints}>
                              {savingPoints ? "Saving..." : "Save"}
                            </Button>
                          </>
                        ) : (
                          <div className="text-red-500">Supabase not configured</div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Tabs defaultValue="overall">
                      <div className="overflow-x-auto pb-2">
                        <TabsList className="w-full justify-start sm:w-auto">
                          <TabsTrigger value="overall">Overall</TabsTrigger>
                          <TabsTrigger value="match1">Match 1</TabsTrigger>
                          <TabsTrigger value="match2">Match 2</TabsTrigger>
                          <TabsTrigger value="match3">Match 3</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="overall">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50">
                              <TableHead className="font-orbitron">#</TableHead>
                              <TableHead className="font-orbitron">Team</TableHead>
                              <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                              <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                              <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                              <TableHead className="font-orbitron text-right">Total Points</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {semifinalOverviewRows.map((row) => (
                              <TableRow key={`semifinals-${row.id}`} className="border-border/50">
                                <TableCell className="font-semibold">{row.rank}.</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{row.group}</div>
                                    <div>{row.team}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{row.totalBooyah}</TableCell>
                                <TableCell className="text-right">{row.totalPlacement}</TableCell>
                                <TableCell className="text-right">{row.totalKills}</TableCell>
                                <TableCell className="text-right font-semibold">{row.totalPoints}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TabsContent>

                      <TabsContent value="match1">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50">
                              <TableHead className="font-orbitron">#</TableHead>
                              <TableHead className="font-orbitron">Team</TableHead>
                              <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                              <TableHead className="font-orbitron text-right">Placement</TableHead>
                              <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                              <TableHead className="font-orbitron text-right">Points</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {semifinalRows.map((row, idx) => {
                              const m = row.matches.match1;
                              return (
                                <TableRow key={`semifinals-m1-${row.id}`} className="border-border/50">
                                  <TableCell className="font-semibold">{idx + 1}.</TableCell>
                                  <TableCell>
                                    <div>{row.team}</div>
                                  </TableCell>
                                  <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.booyah} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match1', 'booyah', e.target.value)} />) : m.booyah}</TableCell>
                                  <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.placement} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match1', 'placement', e.target.value)} />) : m.placement}</TableCell>
                                  <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.kills} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match1', 'kills', e.target.value)} />) : m.kills}</TableCell>
                                  <TableCell className="text-right">{(m.placement||0)+(m.kills||0)}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TabsContent>

                      <TabsContent value="match2">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50">
                              <TableHead className="font-orbitron">#</TableHead>
                              <TableHead className="font-orbitron">Team</TableHead>
                              <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                              <TableHead className="font-orbitron text-right">Placement</TableHead>
                              <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                              <TableHead className="font-orbitron text-right">Points</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {semifinalRows.map((row, idx) => {
                              const m = row.matches.match2;
                              return (
                                <TableRow key={`semifinals-m2-${row.id}`} className="border-border/50">
                                  <TableCell className="font-semibold">{idx + 1}.</TableCell>
                                  <TableCell>
                                    <div>{row.team}</div>
                                  </TableCell>
                                  <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.booyah} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match2', 'booyah', e.target.value)} />) : m.booyah}</TableCell>
                                  <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.placement} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match2', 'placement', e.target.value)} />) : m.placement}</TableCell>
                                  <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.kills} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match2', 'kills', e.target.value)} />) : m.kills}</TableCell>
                                  <TableCell className="text-right">{(m.placement||0)+(m.kills||0)}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TabsContent>

                      <TabsContent value="match3">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50">
                              <TableHead className="font-orbitron">#</TableHead>
                              <TableHead className="font-orbitron">Team</TableHead>
                              <TableHead className="font-orbitron text-right">Booyah!</TableHead>
                              <TableHead className="font-orbitron text-right">Placement</TableHead>
                              <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                              <TableHead className="font-orbitron text-right">Points</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {semifinalRows.map((row, idx) => {
                              const m = row.matches.match3;
                              return (
                                <TableRow key={`semifinals-m3-${row.id}`} className="border-border/50">
                                  <TableCell className="font-semibold">{idx + 1}.</TableCell>
                                  <TableCell>
                                    <div>{row.team}</div>
                                  </TableCell>
                                  <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.booyah} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match3', 'booyah', e.target.value)} />) : m.booyah}</TableCell>
                                  <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.placement} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match3', 'placement', e.target.value)} />) : m.placement}</TableCell>
                                  <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.kills} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match3', 'kills', e.target.value)} />) : m.kills}</TableCell>
                                  <TableCell className="text-right">{(m.placement||0)+(m.kills||0)}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TabsContent>

                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          )}

          <TabsContent value="groupstage">
            <div>
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-2xl">{selectedGame.name} — Finals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {gameId === 'freefire' && semifinalOverviewRows.every((r) => (r.totalPoints || 0) === 0) ? (
                      <div className="p-6 text-center text-muted-foreground">
                        Finalists will be announced once semifinal results are in.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-orbitron">#</TableHead>
                            <TableHead className="font-orbitron">Team</TableHead>
                            <TableHead className="font-orbitron text-right">{gameId === 'bgmi' ? 'WWCD!!' : (gameId === 'freefire' ? 'Booyah!' : 'Games Won')}</TableHead>
                            <TableHead className="font-orbitron text-right">{(gameId === 'freefire' || gameId === 'bgmi') ? 'Placement Point' : 'Total Kills'}</TableHead>
                            <TableHead className="font-orbitron text-right">{(gameId === 'freefire' || gameId === 'bgmi') ? 'Kill Points' : 'Total Deaths'}</TableHead>
                            {showGroupTotalPoints && (
                              <TableHead className="font-orbitron text-right">Total Points</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gameId === 'bgmi' ? (
                            finalsDisplayRows.map((row) => (
                              <TableRow key={`finals-${row.origIdx}`} className="border-border/50">
                                <TableCell className="font-semibold">{row.rank}.</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{groupLetterForIndex(row.origIdx)}</div>
                                    <div>{row.team}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right w-28">
                                  {canEdit ? (
                                    <Input
                                      className="text-right"
                                      type="number"
                                      value={row.wwcd}
                                      onChange={(e) => updateFinalsCell(row.origIdx, "wwcd", e.target.value)}
                                    />
                                  ) : (
                                    row.wwcd
                                  )}
                                </TableCell>
                                <TableCell className="text-right w-36">
                                  {canEdit ? (
                                    <Input
                                      className="text-right"
                                      type="number"
                                      value={row.placement}
                                      onChange={(e) => updateFinalsCell(row.origIdx, "placement", e.target.value)}
                                    />
                                  ) : (
                                    row.placement
                                  )}
                                </TableCell>
                                <TableCell className="text-right w-32">
                                  {canEdit ? (
                                    <Input
                                      className="text-right"
                                      type="number"
                                      value={row.kills}
                                      onChange={(e) => updateFinalsCell(row.origIdx, "kills", e.target.value)}
                                    />
                                  ) : (
                                    row.kills
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-semibold">{row.total}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            Array.from({ length: 12 }, (_, i) => ({ rank: i + 1, team: `Team ${i + 1}`, points: 100 + (12 - i) * 10 })).map((row) => {
                              const gamesPlayed = Math.max(1, Math.floor(row.points / 50));
                              const gamesWon = Math.max(0, Math.floor(gamesPlayed * 0.6));
                              return (
                                <TableRow key={row.rank} className="border-border/50">
                                  <TableCell className="font-semibold">{row.rank}.</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{row.team.split(' ').map(s => s[0]).slice(0,2).join('')}</div>
                                      <div>{row.team}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">{gamesWon}</TableCell>
                                  {showGroupTotalPoints && (
                                    <TableCell className="text-right font-semibold">{row.points}</TableCell>
                                  )}
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

{gameId !== 'freefire' && gameId !== 'bgmi' && (
          <TabsContent value="pointrush">
            {gameId === 'ml' ? (
              <div className="space-y-6">
                {/* Double elimination header */}
                <h3 className="font-orbitron text-2xl tracking-tight">Double Elimination — 8 Teams</h3>
                {canEdit && (
                  <div className="flex items-center gap-3 text-sm mt-2">
                    {isSupabaseConfigured() ? (
                      <>
                        <div className="text-muted-foreground">
                          {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                          {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => { setMlBracket(buildMlBracketFromGroups()); setIsDirty(true); toast.success('Bracket reseeded from groups'); }}>Reseed from Groups</Button>
                        <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveAllPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                      </>
                    ) : (
                      <div className="text-red-500">Supabase not configured</div>
                    )}
                  </div>
                )}

                {(() => {
                  const sortByPoints = (letter: GroupLetter) => {
                    const base = (mlGroupData[letter] ?? mobileLegendsGroupData[letter]).map((r, i) => ({ ...r, originalIndex: r.originalIndex ?? i }));
                    const withStats = base.map((r) => {
                      const pts = typeof r.points === 'number' ? r.points : Number(r.points) || 0;
                      const stats = deriveGroupRowStats(r);
                      return { ...r, points: pts, ...stats };
                    });
                    withStats.sort((a, b) => {
        const aw = Number(a.gamesWon ?? 0) || 0;
        const bw = Number(b.gamesWon ?? 0) || 0;
        if (bw !== aw) return bw - aw;
        const ap = Number(a.points ?? 0) || 0;
        const bp = Number(b.points ?? 0) || 0;
        if (bp !== ap) return bp - ap;
        return a.team.localeCompare(b.team);
      });
                    return withStats;
                  };

                  const A = sortByPoints('A').slice(0,2).map(r => r.team);
                  const B = sortByPoints('B').slice(0,2).map(r => r.team);
                  const C = sortByPoints('C').slice(0,2).map(r => r.team);
                  const D = sortByPoints('D').slice(0,2).map(r => r.team);

                  const quarterfinals = [
                    // UB1: A1 vs D2
                    { teamA: A[0] ?? '—', teamB: D[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                    // UB2: B1 vs C2
                    { teamA: B[0] ?? '—', teamB: C[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                    // UB3: C1 vs B2
                    { teamA: C[0] ?? '—', teamB: B[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                    // UB4: D1 vs A2
                    { teamA: D[0] ?? '��', teamB: A[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                  ];

                  // Build full double-elimination bracket (upper + lower)
                  const upperSemis = [
                    { teamA: 'Winner UB1', teamB: 'Winner UB2', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                    { teamA: 'Winner UB3', teamB: 'Winner UB4', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                  ];

                  const upperFinal = [
                    { teamA: 'Winner UB5', teamB: 'Winner UB6', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                  ];

                  const lowerRound1 = [
                    { teamA: 'Loser UB1', teamB: 'Loser UB2', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                    { teamA: 'Loser UB3', teamB: 'Loser UB4', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                  ];

                  const lowerQFs = [
                    { teamA: 'Winner LB1', teamB: 'Loser UB6', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                    { teamA: 'Winner LB2', teamB: 'Loser UB5', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                  ];

                  const lowerSemi = [
                    { teamA: 'Winner LB3', teamB: 'Winner LB4', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                  ];

                  const lowerFinal = [
                    { teamA: 'Loser UB7', teamB: 'Winner LB5', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                  ];

                  const grandFinal = [
                    { teamA: 'Winner UB7', teamB: 'Winner LB6', scoreA: 0, scoreB: 0, status: 'upcoming' as const },
                  ];

                  const columns = [
                    { title: 'Upper • Quarterfinals', matches: quarterfinals },
                    { title: 'Upper • Semifinals', matches: upperSemis },
                    { title: 'Upper • Final', matches: upperFinal },
                    { title: 'Lower • Round 1 (Elimination)', matches: lowerRound1 },
                    { title: 'Lower • Quarterfinals', matches: lowerQFs },
                    { title: 'Lower • Semifinal', matches: lowerSemi },
                    { title: 'Lower • Final', matches: lowerFinal },
                    { title: 'Grand Final', matches: grandFinal },
                  ] as const;

                  const upperColumns = { columns: columns.slice(0, 3) } as any;
                  const lowerColumns = { columns: columns.slice(3, columns.length - 1) } as any;

                  return (
                    <div className="space-y-6">
                      <Tabs defaultValue="bracket">
                        <TabsList className="w-full justify-start sm:w-auto">
                          <TabsTrigger value="bracket">Bracket</TabsTrigger>
                          <TabsTrigger value="grand">Grand Final</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bracket" className="mt-4">
                          <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-4">
                            <h4 className="text-sm uppercase text-muted-foreground mb-3">Upper Bracket</h4>
                            <BracketView bracket={{ columns: (mlBracket ?? buildMlBracketFromGroups()).columns.slice(0,3) } as any} onScoreChange={canEdit ? handleMlScoreChange : undefined} />
                          </div>

                          <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-4">
                            <h4 className="text-sm uppercase text-muted-foreground mb-3">Lower Bracket (Losers)</h4>
                            <BracketView bracket={{ columns: (mlBracket ?? buildMlBracketFromGroups()).columns.slice(3,7) } as any} onScoreChange={canEdit ? handleMlScoreChange : undefined} colOffset={3} />
                          </div>

                          <div className="text-right text-xs text-muted-foreground mt-2">Winners advance in Upper Bracket; losers move to Lower Bracket.</div>
                        </TabsContent>

                        <TabsContent value="grand" className="mt-4">
                          <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-6 text-center">
                            <h4 className="text-sm uppercase text-muted-foreground mb-3">Grand Final</h4>
                            <div className="max-w-xl mx-auto">
                              <BracketView bracket={{ columns: [(mlBracket ?? buildMlBracketFromGroups()).columns[7]] } as any} onScoreChange={canEdit ? handleMlScoreChange : undefined} colOffset={7} />
                            </div>
                            <div className="text-xs text-muted-foreground mt-3">Grand Final determines the champion. If Upper Bracket winner loses, bracket-specific rules apply.</div>
                          </div>
                        </TabsContent>

                      </Tabs>
                    </div>
                  );
                })()}
              </div>
            ) : gameId === 'codm' ? (
              <div className="space-y-6">
                <h3 className="font-orbitron text-2xl tracking-tight">Playoffs — Top 8</h3>
                {canEdit && (
                  <div className="flex items-center gap-3 text-sm mt-2">
                    {isSupabaseConfigured() ? (
                      <>
                        <div className="text-muted-foreground">
                          {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                          {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => { setCodmBracket(buildCodmBracketFromOverall(codmOverall.map(r => r.team))); setIsDirty(true); toast.success('Bracket reseeded from leaderboard'); }}>Reseed from Leaderboard</Button>
                        <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveAllPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                      </>
                    ) : (
                      <div className="text-red-500">Supabase not configured</div>
                    )}
                  </div>
                )}

                <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-4">
                  <BracketView bracket={(codmBracket ?? buildCodmBracketFromOverall(codmOverall.map(r => r.team))) as any} onScoreChange={canEdit ? handleCodmScoreChange : undefined} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Upper Bracket - visual bracket style */}
                <div>
                  <h3 className="font-orbitron text-2xl mb-4">Upper Bracket</h3>
                  <div className="relative flex gap-6 items-start">
                    {/* Quarterfinals column */}
{gameId !== 'valorant' && gameId !== 'codm' && (
                    <div className="flex flex-col gap-6 w-full md:w-1/4">
                      {[{ teamA: 'Team 1', teamB: 'Team 2', scoreA: 2, scoreB: 1, label: 'QF 1' },
                        { teamA: 'Team 3', teamB: 'Team 4', scoreA: 2, scoreB: 0, label: 'QF 2' },
                        { teamA: 'Team 5', teamB: 'Team 6', scoreA: 1, scoreB: 2, label: 'QF 3' },
                        { teamA: 'Team 7', teamB: 'Team 8', scoreA: 0, scoreB: 2, label: 'QF 4' }].map((m, i) => (
                        <div key={i} className="bg-black text-white rounded-md p-3 shadow-sm border border-border/30">
                          <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">{m.teamA.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                              <div className="text-sm font-medium">{m.teamA}</div>
                            </div>
                            <div className="text-sm font-bold">{m.scoreA}</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">{m.teamB.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                              <div className="text-sm font-medium">{m.teamB}</div>
                            </div>
                            <div className="text-sm font-bold">{m.scoreB}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                    {/* Semifinals column with connector line */}
                    <div className="flex flex-col gap-12 w-full md:w-1/4 self-center">
                      <div className="border-l-2 border-dashed border-border/30 pl-6">
                        <div className="bg-black text-white rounded-md p-3 shadow-sm border border-border/30">
                          <div className="text-xs text-muted-foreground">SF 1</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">TF</div>
                              <div className="text-sm font-medium">Team 1</div>
                            </div>
                            <div className="text-sm font-bold">2</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">PG</div>
                              <div className="text-sm font-medium">Team 3</div>
                            </div>
                            <div className="text-sm font-bold">0</div>
                          </div>
                        </div>

                        <div className="mt-6 bg-black text-white rounded-md p-3 shadow-sm border border-border/30">
                          <div className="text-xs text-muted-foreground">SF 2</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">TV</div>
                              <div className="text-sm font-medium">Team 6</div>
                            </div>
                            <div className="text-sm font-bold">1</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">VP</div>
                              <div className="text-sm font-medium">Team 8</div>
                            </div>
                            <div className="text-sm font-bold">2</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Final column */}
                    <div className="flex flex-col gap-24 w-full md:w-1/4 self-center">
                      <div className="border-l-2 border-dashed border-border/30 pl-6">
                        <div className="bg-black text-white rounded-md p-3 shadow-md border border-border/40">
                          <div className="text-xs text-muted-foreground">Upper Bracket Final</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-semibold">T1</div>
                              <div className="text-sm font-semibold">Team 1</div>
                            </div>
                            <div className="text-lg font-bold">3</div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-semibold">T8</div>
                              <div className="text-sm font-semibold">Team 8</div>
                            </div>
                            <div className="text-lg font-bold">2</div>
                          </div>
                        </div>
                        {/*

                        <div className="mt-6 text-center">
                          <div className="inline-block border border-yellow-400 text-yellow-400 px-4 py-2 rounded-full font-semibold">Qualified</div>
                        </div>
                        */}
                      </div>
                    </div>

                    {/* Advances column */}
                    <div className="flex flex-col gap-6 w-full md:w-1/4 self-center">
                      {/*<div className="text-sm text-muted-foreground mb-2">Advances</div>*/}
                      <div className="mt-6">
                        <Card className="p-4 text-center bg-black border border-yellow-400 text-yellow-400">
                          <div className="font-semibold">Team 1</div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lower Bracket - tracks eliminations and deciders */}
                <div>
                  <h3 className="font-orbitron text-2xl mb-4">Lower Bracket</h3>
                  <div className="grid grid-cols-5 gap-6 items-start">
                    {/* Round 1 - losers from QFs */}
{gameId !== 'valorant' && gameId !== 'codm' && (
                    <div className="flex flex-col gap-6 col-span-1">
                      {[{ teamA: 'Team 2', teamB: 'Team 4', scoreA: 1, scoreB: 2, label: 'LB R1' }, { teamA: 'Team 5', teamB: 'Team 7', scoreA: 0, scoreB: 2, label: 'LB R1' }].map((m, i) => (
                        <div key={i} className="bg-black text-white rounded-md p-3 shadow-sm border border-border/30">
                          <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">{m.teamA.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                              <div className="text-sm font-medium">{m.teamA}</div>
                            </div>
                            <div className="text-sm font-bold">{m.scoreA}</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">{m.teamB.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                              <div className="text-sm font-medium">{m.teamB}</div>
                            </div>
                            <div className="text-sm font-bold">{m.scoreB}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                    {/* Lower QFs */}
{gameId !== 'valorant' && gameId !== 'codm' && (
                    <div className="flex flex-col gap-5 col-span-1">
                      <div className="border-l-2 border-dashed border-border/30 pl-6">
                        <div className="bg-black text-white rounded-md p-3 shadow-sm border border-border/30">
                          <div className="text-xs text-muted-foreground">Lower QF</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">T3</div>
                              <div className="text-sm font-medium">Team 3</div>
                            </div>
                            <div className="text-sm font-bold">2</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">T4</div>
                              <div className="text-sm font-medium">Team 4</div>
                            </div>
                            <div className="text-sm font-bold">1</div>
                          </div>
                        </div>
                      </div>
                      <div className="border-l-2 border-dashed border-border/30 pl-6">
                        <div className="bg-black text-white rounded-md p-3 shadow-sm border border-border/30">
                          <div className="text-xs text-muted-foreground">Lower QF</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">T6</div>
                              <div className="text-sm font-medium">Team 6</div>
                            </div>
                            <div className="text-sm font-bold">2</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">T7</div>
                              <div className="text-sm font-medium">Team 7</div>
                            </div>
                            <div className="text-sm font-bold">1</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                    {/* Lower SF */}
                    <div className="flex flex-col gap-16 col-span-1 self-center">
                      <div className="border-l-2 border-dashed border-border/30 pl-6">
                        <div className="bg-black text-white rounded-md p-3 shadow-sm border border-border/30">
                          <div className="text-xs text-muted-foreground">Lower SF</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">T3</div>
                              <div className="text-sm font-medium">Team 3</div>
                            </div>
                            <div className="text-sm font-bold">3</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">T6</div>
                              <div className="text-sm font-medium">Team 6</div>
                            </div>
                            <div className="text-sm font-bold">0</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lower Bracket Final */}
                    <div className="flex flex-col gap-16 col-span-1 self-center">
                      <div className="border-l-2 border-dashed border-border/30 pl-6">
                        <div className="bg-black text-white rounded-md p-3 shadow-sm border border-border/30">
                          <div className="text-xs text-muted-foreground">Lower Bracket Final</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">T3</div>
                              <div className="text-sm font-medium">Team 3</div>
                            </div>
                            <div className="text-sm font-bold">3</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold">T8</div>
                              <div className="text-sm font-medium">Team 8</div>
                            </div>
                            <div className="text-sm font-bold">0</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Advances */}
                    <div className="flex flex-col gap-6 col-span-1 self-center">
                      {/*<div className="text-sm text-muted-foreground mb-2">Advances</div>*/}
                      <div className="mt-6">
                        <Card className="p-4 text-center bg-black border border-yellow-400 text-yellow-400">
                          <div className="font-semibold">Team 3</div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </TabsContent>
          )}

        </Tabs>

              {/* Contact Information (independent of tabs) */}
              <div className="mt-6">
                <Card className="glass-card border-border/30 bg-black text-white">
  <CardHeader>
    <CardTitle className="font-orbitron text-2xl">For Queries</CardTitle>
  </CardHeader>
  <CardContent>
    {selectedGame?.gameHead ? (
      <p className="text-lg text-muted-foreground">
        For any queries, DM or contact the{' '}
        <span className="font-semibold text-yellow-400">
          Game Head — {selectedGame.gameHead.name}
        </span>{' '}
        at{' '}
        <a href={`tel:${selectedGame.gameHead.phone}`} className="font-semibold text-yellow-400">
          {selectedGame.gameHead.phone}
        </a>.
      </p>
    ) : (
      <p className="text-lg text-muted-foreground">
        For any queries, please reach out to the event organizers.
      </p>
    )}
  </CardContent>
</Card>
              </div>


      </div>
    );
  };

const header = (
  <div className="mb-8 overflow-hidden rounded-xl border border-border/50 sm:mb-10">
    {/* 🔹 Buttons Row — now above the image */}
    <div className="flex justify-between items-center px-4 sm:px-6 py-3 bg-background/70 backdrop-blur-sm border-b border-border/40">
      {/* <div>
        {gameId && (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate(`/events/${event?.id}/leaderboard`)}
          >
            All Games
          </Button>
        )}
      </div> */}
      <div>
        <Link to="/events/lock-load">
          <Button variant="outline" className="w-full sm:w-auto">
            Back
          </Button>
        </Link>
      </div>
    </div>

    {/* 🔹 Image Header Section */}
    <div className="relative h-48 sm:h-56 md:h-64">
      <img
        src={selectedGame?.image ?? event?.image}
        alt={selectedGame ? selectedGame.name : event?.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      <div className="relative z-10 flex h-full flex-col justify-end gap-4 p-4 sm:p-6">
        <div className="flex flex-col gap-4 text-white sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              {event?.title}
            </h1>

            {/* Game-specific info */}
            {gameId && selectedGame && (
              <>
              <div className="mt-2 sm:mt-3">
                <h2 className="font-orbitron text-lg sm:text-xl text-yellow-400">
                  {selectedGame.name} — Leaderboard
                </h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Prize pool:{" "}
                  <span className="font-orbitron font-semibold text-yellow-400">
                    {event?.prize}
                  </span>
                </p>
              </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <Badge variant={event?.status === "live" ? "default" : "outline"}>
                {event?.status === "live" ? "Live" : "Completed"}
              </Badge>
      
              <Badge variant="outline">{selectedGame.participants} participants</Badge>
              <Badge variant="outline">Prize {event?.prize}</Badge>
            </div>
            </>
            )}

            {/* Badges */}
          </div>
        </div>
      </div>
    </div>
  </div>
);


  return (
    <div className="min-h-screen pt-20 pb-12 sm:pt-24">
      <div className="container mx-auto px-4">
        {header}

        {!gameId ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.games.map((game) => (
              <div
                key={game.id}
                className="group cursor-pointer rounded-xl bg-gradient-to-r from-primary/40 via-secondary/40 to-accent/40 p-[1px] transition-transform hover:scale-[1.01]"
                onClick={() => navigate(`/events/${event.id}/leaderboard/${game.id}`)}
              >
                <Card className="overflow-hidden rounded-[11px]">
                  <div className="relative h-44 overflow-hidden">
                    <img src={game.image} alt={game.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <CardTitle className="font-orbitron text-xl">{game.name}</CardTitle>
                      <Button size="sm" className="opacity-0 transition-opacity group-hover:opacity-100">View</Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">{renderTable()}</div>
        )}
      </div>
    </div>
  );
};

export default EventLeaderboard;
