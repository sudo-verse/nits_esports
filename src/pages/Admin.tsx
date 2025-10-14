import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listEvents, getEventById, updateGameRankings, replaceAllEvents, Event, RankingRow } from "@/data/eventsStore";
import { toast } from "sonner";

const Admin = () => {
  const onlyLock = (data: Event[]) => data.filter((e) => e.id === "lock-load");
  const [events, setEvents] = useState<Event[]>(onlyLock(listEvents()));
  const [eventId, setEventId] = useState<string>(events[0]?.id ?? "lock-load");
  const currentEvent = useMemo(() => events.find((e) => e.id === eventId) ?? events[0], [events, eventId]);
  const [gameId, setGameId] = useState<string>(currentEvent?.games[0]?.id ?? "");
  const currentGame = useMemo(() => currentEvent?.games.find((g) => g.id === gameId) ?? currentEvent?.games[0], [currentEvent, gameId]);
  const [rows, setRows] = useState<RankingRow[]>(currentGame?.rankings ?? []);

  // sync when selection changes
  const onEventChange = (id: string) => {
    setEventId(id);
    const e = events.find((x) => x.id === id) ?? events[0];
    const first = e?.games[0]?.id ?? "";
    setGameId(first);
    setRows(e?.games.find((g) => g.id === first)?.rankings ?? []);
  };
  const onGameChange = (gid: string) => {
    setGameId(gid);
    const g = currentEvent?.games.find((x) => x.id === gid);
    setRows(g?.rankings ?? []);
  };

  const addRow = () => setRows((r) => [...r, { rank: r.length + 1, team: "", points: 0 }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i).map((row, idx) => ({ ...row, rank: idx + 1 })));
  const updateCell = (i: number, key: keyof RankingRow, value: string) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: key === "points" || key === "rank" ? Number(value) || 0 : value } : row)));
  };

  const save = () => {
    if (!currentEvent || !currentGame) return;
    updateGameRankings(currentEvent.id, currentGame.id, rows);
    const updated = listEvents();
    setEvents(onlyLock(updated));
    toast.success("Leaderboard saved");
  };

  const exportJSON = async () => {
    const data = JSON.stringify(listEvents(), null, 2);
    try {
      await navigator.clipboard.writeText(data);
      toast.success("Exported to clipboard");
    } catch {
      toast.message("Copy failed, showing modal");
      alert(data);
    }
  };

  const importJSON = () => {
    const text = prompt("Paste events JSON");
    if (!text) return;
    try {
      const parsed = JSON.parse(text) as Event[];
      replaceAllEvents(parsed);
      setEvents(onlyLock(listEvents()));
      onEventChange("lock-load");
      toast.success("Imported events data");
    } catch {
      toast.error("Invalid JSON");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-orbitron text-3xl font-bold text-gradient">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportJSON}>Export</Button>
            <Button variant="outline" onClick={importJSON}>Import</Button>
            <Button variant="destructive" onClick={async () => { const { error } = await (await import("@/lib/supabase")).supabase.auth.signOut(); if (!error) location.href = "/login"; }}>Logout</Button>
          </div>
        </div>

        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="font-orbitron">Event Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((e) => (
                <Card key={e.id} className="overflow-hidden">
                  <div className="relative h-32">
                    <img src={e.image} alt={e.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  </div>
                  <CardHeader>
                    <CardTitle className="font-orbitron text-xl">{e.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Link to={`/events/${e.id}/leaderboard`}>
                        <Button className="font-orbitron">Manage</Button>
                      </Link>
                      <Link to={`/events/${e.id}`}>
                        <Button variant="outline" className="font-orbitron">View Public</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-orbitron">Quick Edit (Legacy)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Event</Label>
              <Select value={eventId} onValueChange={onEventChange}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select event" /></SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Game</Label>
              <Select value={gameId} onValueChange={onGameChange}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select game" /></SelectTrigger>
                <SelectContent>
                  {(currentEvent?.games ?? []).map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="font-orbitron">Edit Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Rank</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i} className="border-border/50">
                      <TableCell className="w-24">
                        <Input type="number" value={row.rank} onChange={(e) => updateCell(i, "rank", e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input value={row.team} onChange={(e) => updateCell(i, "team", e.target.value)} />
                      </TableCell>
                      <TableCell className="w-32 text-right">
                        <Input className="text-right" type="number" value={row.points} onChange={(e) => updateCell(i, "points", e.target.value)} />
                      </TableCell>
                      <TableCell className="w-40">
                        <Input value={row.prize ?? ""} onChange={(e) => updateCell(i, "prize", e.target.value)} />
                      </TableCell>
                      <TableCell className="w-24 text-right">
                        <Button variant="destructive" onClick={() => removeRow(i)}>Remove</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={addRow}>Add Row</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
