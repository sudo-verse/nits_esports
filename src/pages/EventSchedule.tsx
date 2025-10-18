import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useParams } from "react-router-dom";
import { getEventById } from "@/data/eventsStore";
import { Button } from "@/components/ui/button";
import { parse, addDays, differenceInCalendarDays, format } from "date-fns";

const EventSchedule = () => {
  const { eventId } = useParams();
  const storeEvent = eventId ? getEventById(eventId) : undefined;

  // Fallback event for Lock & Load
  const event =
    storeEvent ??
    (eventId === "lock-load"
      ? {
          id: "lock-load",
          title: "Lock & Load",
          date: "Oct 12, 2025",
          startDate: "Oct 12, 2025",
          endDate: "Oct 18, 2025",
          location: "Online",
          participants: 117,
          prize: "₹10,000",
          status: "live",
          image:
            "https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2F8efd1aa0a2864beeb58f62fed4425fdd?format=webp&width=1200",
          games: [
            {
              id: "bgmi",
              name: "BGMI",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 12, 2025", time: "9:00 PM - 9:45 PM", matchups: ["Group A vs Group B", "Group C vs Group D"] },
                { date: "Oct 12, 2025", time: "10:00 PM - 10:45 PM", matchups: ["Group A vs Group C", "Group B vs Group D"] },
                { date: "Oct 12, 2025", time: "11:00 PM - 11:45 PM", matchups: ["Group A vs Group D", "Group B vs Group C"] },
              ],
            },
            {
              id: "freefire",
              name: "FreeFire",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 13, 2025", time: "6:00 PM - 6:40 PM", matchups: ["Group A , Group B"] },
                { date: "Oct 13, 2025", time: "6:40 PM - 7:20 PM", matchups: ["Group C , Group D"] },
                { date: "Oct 13, 2025", time: "7:20 PM - 8:00 PM", matchups: ["Group A , Group B"] },
                { date: "Oct 13, 2025", time: "8:00 PM - 8:40 PM", matchups: ["Group C , Group D"] },
              ],
            },
            {
              id: "MobileLegends",
              name: "Mobile Legends",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 13, 2025", time: "9:30 PM - 10:15 PM", matchups: ["Group A1 vs A2 , Group A3 vs A4 , Group B1 vs B2 , Group B3 vs B4"] },
                { date: "Oct 13, 2025", time: "10:15 PM - 11:00 PM", matchups: ["Group A1 vs A3 , Group A2 vs A4 , Group B1 vs B3 , Group B2 vs B4"] },
                { date: "Oct 13, 2025", time: "11:00 PM - 11:45 PM", matchups: ["Group A1 vs A4 , Group A2 vs A3 , Group B1 vs B4 , Group B2 vs B3"] },
              ],
            },
            {
              id: "valorant",
              name: "Valorant",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 14, 2025", time: "6:00 PM - 7:00 PM", matchups: ["Group A1 vs A3 , Group B1 vs B3 , Group C1 vs C3"] },
                { date: "Oct 14, 2025", time: "7:00 PM - 8:00 PM", matchups: ["Group A2 vs A3 , Group B2 vs B3 , Group C2 vs C3"] },
                { date: "Oct 14, 2025", time: "8:00 PM - 9:00 PM", matchups: ["Group A1 vs A2 , Group B1 vs B2 , Group C1 vs C2"] },
              ],
            },
            {
              id: "MobileLegends",
              name: "Mobile Legends",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 14, 2025", time: "9:30 PM - 10:15 PM", matchups: ["Group C1 vs C2 , Group C3 vs C4 , Group D1 vs D2 , Group D3 vs D4"] },
                { date: "Oct 14, 2025", time: "10:15 PM - 11:00 PM", matchups: ["Group C1 vs C3 , Group C2 vs C4 , Group D1 vs D3 , Group D2 vs D4"] },
                { date: "Oct 14, 2025", time: "11:00 PM - 11:45 PM", matchups: ["Group C1 vs C4 , Group C2 vs C3 , Group D1 vs D4 , Group D2 vs D3"] },
              ],
            },
            {
              id: "valorant",
              name: "Valorant",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 15, 2025", time: "06:00 PM - 07:00 PM", matchups: ["Whiff Master vs N-Zigger"] },
                { date: "Oct 15, 2025", time: "07:00 PM - 08:00 PM", matchups: ["Aloo Pitika vs N-Zigger"] },
                { date: "Oct 15, 2025", time: "08:00 PM - 09:00 PM", matchups: ["Whiff Master vs Aloo Pitika"] },
              ],
            },
            {
              id: "CODM",
              name: "COD Mobile",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 15, 2025", time: "06:30 PM - 07:15 PM", matchups: ["MATCH 1"] },
                { date: "Oct 15, 2025", time: "07:15 PM - 08:00 PM", matchups: ["MATCH 2"] },
                { date: "Oct 15, 2025", time: "08:00 PM - 08:45 PM", matchups: ["MATCH 3"] },
              ],
            },
            {
              id: "MobileLegends",
              name: "Mobile Legends",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 15, 2025", time: "9:30 PM - 10:15 PM", matchups: ["UPPER BRACKET QUARTER-FINAL"] },
                { date: "Oct 15, 2025", time: "10:15 PM - 11:00 PM", matchups: ["UPPER BRACKET SEMI-FINAL , LOWER BRACKET ROUND 1"] },
                { date: "Oct 15, 2025", time: "11:00 PM - 11:45 PM", matchups: ["UPPER BRACKET FINAL , LOWER BRACKET SEMI-FINAL"] },
              ],
            },
            {
              id: "CODM",
              name: "COD Mobile",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 16, 2025", time: "06:00 PM - 06:45 PM", matchups: ["Quarter-Final "] },
                { date: "Oct 16, 2025", time: "06:45 PM - 07:30 PM", matchups: ["Semi-Final"] },
              ],
            },
            {
              id: "freefire",
              name: "FreeFire",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 16, 2025", time: "06:30 PM - 07:15 PM", matchups: ["SF MATCH 1"] },
                { date: "Oct 16, 2025", time: "07:15 PM - 08:00 PM", matchups: ["SF MATCH 2"] },
                { date: "Oct 16, 2025", time: "08:00 PM - 08:45 PM", matchups: ["SF MATCH 3"] },
              ],
            },
            {
              id: "MobileLegends",
              name: "Mobile Legends",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 16, 2025", time: "9:30 PM - 10:15 PM", matchups: ["LOWER BRACKET SEMI-FINAL"] },
                { date: "Oct 16, 2025", time: "10:15 PM - 11:00 PM", matchups: ["LOWER BRACKET FINAL "] },
              ],
            },
            {
              id: "none",
              name: "No Matches",
              image: "",
              format: "none",
              rankings: [],
              schedule: [
                { date: "Oct 17, 2025", time: "-", matchups: ["No matches scheduled for this day."] },
              ],
            },
            {
              id: "allgames",
              name: "CODM , FREEFIRE , MLBB , VALORANT",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 18, 2025", time: "10:00 AM - 12:45 PM", matchups: ["FINALS — Venue: CC-06"]
},
    
              ],
            },
            {
              id: "bgmi",
              name: "BGMI",
              image: "",
              format: "points",
              rankings: [],
              schedule: [
                { date: "Oct 18, 2025", time: "02:00 PM - 04:30 PM", matchups: ["FINALS — Venue: CC-06"]
 },
    
              ],
            },
            
            

          ],
        }
      : undefined);

  if (!event) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 text-center text-muted-foreground">Event not found.</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Build a map of date -> schedule rows
  const scheduleByDay: Record<string, { key: string; time: string; game: string; matchups: string }[]> = {};

  event.games.forEach((game) => {
    if (game.schedule && Array.isArray(game.schedule)) {
      game.schedule.forEach((slot, idx) => {
        const slotDate = slot.date ?? event.startDate; // fallback to startDate if date not provided
        const dayStr = format(parse(slotDate, "MMM d, yyyy", new Date()), "MMM d, yyyy");

        if (!scheduleByDay[dayStr]) scheduleByDay[dayStr] = [];
        scheduleByDay[dayStr].push({
          key: `${game.id}-slot-${idx}`,
          time: slot.time,
          game: game.name,
          matchups: Array.isArray(slot.matchups) ? slot.matchups.join(", ") : String(slot.matchups),
        });
      });
    }
  });

  // Generate all event days
  const days: Date[] = [];
  if (event.startDate && event.endDate) {
    const start = parse(event.startDate, "MMM d, yyyy", new Date());
    const end = parse(event.endDate, "MMM d, yyyy", new Date());
    const diff = Math.max(0, differenceInCalendarDays(end, start));
    for (let i = 0; i <= diff; i++) days.push(addDays(start, i));
  } else if (event.date) {
    days.push(parse(event.date, "MMM d, yyyy", new Date()));
  }

  const displayTitle = event.id === "lock-load" ? `${event.title} Schedule` : event.title;
  const displayDate = event.startDate && event.endDate ? `${event.startDate} to ${event.endDate}` : event.date;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-orbitron text-4xl font-bold">{displayTitle}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-4 mt-2">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> {displayDate}
              </span>
              {event.location ? (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {event.location}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/schedule">
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </div>

        {days.map((day) => {
          const dayStr = format(day, "MMM d, yyyy");
          const daySchedule = scheduleByDay[dayStr] ?? [];

          return (
            <Card key={dayStr} className="glass-card border-border/50 mb-6">
              <CardHeader>
                <CardTitle className="font-orbitron">{dayStr}</CardTitle>
              </CardHeader>
              <CardContent>
                {daySchedule.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="font-orbitron">Time</TableHead>
                          <TableHead className="font-orbitron">Game</TableHead>
                          <TableHead className="font-orbitron">Matchups</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {daySchedule.map((r) => (
                          <TableRow key={`${dayStr}-${r.key}`} className="border-border/50 hover:bg-primary/5 transition-colors">
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-secondary" /> {r.time}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-semibold">{r.game}</TableCell>
                            <TableCell>
                              <div className="text-sm text-foreground">{r.matchups}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">Schedule coming soon for this day.</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EventSchedule;