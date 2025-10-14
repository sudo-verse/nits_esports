import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { listEvents } from "@/data/eventsStore";
import lockImg from "@/assets/valorant.jpg";

const Events = () => {
  const allEvents = listEvents();
  const liveEvents = allEvents.filter((e) => e.status === "live");
  const pastEvents = allEvents.filter((e) => e.status === "past");

  const upcoming = [
    {
      id: "lock-load",
      title: "Lock & Load",
      date: "Oct 12, 2025 - Oct 19, 2025",
      location: "Online",
      prize: "₹10,000",
      image: "https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2F8efd1aa0a2864beeb58f62fed4425fdd?format=webp&width=1200",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
         <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gradient">
  Events & Tournaments
</h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Live and past tournaments with per-game leaderboards
          </p>
        </div>

        {/* Upcoming Events */}
        <section className="mb-16">
          <h2 className="font-orbitron text-3xl font-bold mb-8 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Live Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((event) => (
              <Card key={event.id} className="glass-card border-secondary/20 hover:border-secondary/50 transition-all overflow-hidden group">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  <Badge className="absolute top-4 right-4 bg-secondary/90 font-orbitron">
                    Live
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="font-orbitron text-xl">{event.title}</CardTitle>
                  <div className="text-sm text-muted-foreground space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      {event.location}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-secondary" />
                      <span className="text-sm">117 Teams</span>
                      
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-accent" />
                      <span className="text-sm font-semibold">{event.prize}</span>
                    </div>
                  </div>
                  {/* <div className="grid grid-cols-2 gap-2"> */}
                  <div>
                    <Link to={`/events/${event.id}`}>
                      <Button className="w-full font-orbitron">Details</Button>
                    </Link>
                    <a href="https://forms.gle/uEKn5cnCHTqT6zo26" target="_blank" rel="noreferrer">
                      {/* <Button variant="outline" className="w-full font-orbitron">Register</Button> */}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
{/*
        <section className="mb-16">
          <h2 className="font-orbitron text-3xl font-bold mb-8 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Live Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveEvents.map((event) => (
              <Card key={event.id} className="glass-card border-primary/20 hover:border-primary/50 transition-all hover:glow-primary overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  <Badge className="absolute top-4 right-4 bg-primary/90 font-orbitron">
                    Live
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="font-orbitron text-xl">{event.title}</CardTitle>
                  <div className="text-sm text-muted-foreground space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      {event.location}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-secondary" />
                      <span className="text-sm">{event.participants} clubs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-accent" />
                      <span className="text-sm font-semibold">{event.prize}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to={`/events/${event.id}/leaderboard`}>
                      <Button className="w-full font-orbitron glow-primary">Leaderboard</Button>
                    </Link>
                    <a href="https://forms.gle/uEKn5cnCHTqT6zo26" target="_blank" rel="noreferrer">
                      <Button variant="outline" className="w-full font-orbitron">Register</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-orbitron text-3xl font-bold mb-8 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-accent" />
            Past Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <Card key={event.id} className="glass-card border-border/50 overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  <Badge variant="outline" className="absolute top-4 right-4 border-accent/50 text-accent">
                    Completed
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="font-orbitron">{event.title}</CardTitle>
                  <CardDescription className="mt-2">
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
                <CardContent>
                  <Link to={`/events/${event.id}/leaderboard`}>
                    <Button variant="outline" className="w-full font-orbitron">View Results</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
*/}
        {/* Live Events */}

        {/* Past Events */}
 
      </div>
    </div>
  );
};

export default Events;
