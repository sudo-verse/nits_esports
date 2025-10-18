import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { listEvents } from "@/data/eventsStore";

const Schedule = () => {
  const ongoing = listEvents().filter((e) => e.status === "live" && e.id !== "ewc-2025");

  const lockEvent = {
    id: "lock-load",
    title: "Lock & Load",
    date: "Oct 12, 2025 - Oct 18, 2025",
    startDate: "Oct 12, 2025",
    endDate: "Oct 18, 2025",
    location: "Online",
    participants: 117,
    prize: "₹10,000",
    image: "https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2F8efd1aa0a2864beeb58f62fed4425fdd?format=webp&width=1200",
  };

  const displayEvents = [lockEvent, ...ongoing.filter((e) => e.id !== lockEvent.id)];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-5xl font-bold mb-4 text-gradient">Schedule</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Ongoing tournaments and fixtures</p>
        </div>

        {displayEvents.length === 0 ? (
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 text-center text-muted-foreground">No ongoing events right now.</CardContent>
          </Card>
        ) : (
          <section className="mb-16">
            <h2 className="font-orbitron text-3xl font-bold mb-8 flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              Live Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.map((event) => (
                <Card key={event.id} className="glass-card border-primary/20 hover:border-primary/50 transition-all overflow-hidden group">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-primary/90 font-orbitron">
                      Live
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="font-orbitron text-xl">{event.title}</CardTitle>
                    <CardDescription className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        {event.location}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-secondary" />
                        <span className="text-sm">{event.participants} Teams</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-accent" />
                        <span className="text-sm font-semibold">{event.prize}</span>
                      </div>
                    </div>
                    <div>
                      <Link to={`/events/${event.id}/schedule`}>
                        <Button className="w-full font-orbitron">Schedule</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Schedule;
