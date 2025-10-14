import { useState } from "react";
import { ArrowRight, Trophy, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroVideo from "@/assets/esports.mp4";

const Home = () => {
  const [isMuted, setIsMuted] = useState(true); // ✅ Must be here

  const features = [
    {
      icon: Trophy,
      title: "Competitive Gaming",
      description: "Participate in tournaments and climb the rankings",
    },
    {
      icon: Users,
      title: "Active Community",
      description: "Join a vibrant community of passionate gamers",
    },
    {
      icon: Calendar,
      title: "Regular Events",
      description: "Weekly tournaments and gaming sessions",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* 🎥 Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={heroVideo}
          autoPlay
          loop
          muted={isMuted}
          playsInline
        />

        {/* Unmute / Mute Button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-8 right-8 z-30 px-4 py-2 bg-black/60 text-white rounded-lg 
                     hover:bg-black/80 transition font-orbitron text-sm"
        >
          {isMuted ? "🔊 Unmute" : "🔇 Mute"}
        </button>

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background z-10" />

        {/* Foreground Content */}
        <div className="container mx-auto px-4 pt-20 sm:pt-24 md:pt-28 z-20 text-center">
  <h1 className="font-orbitron text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-gradient leading-tight">
    NIT SILCHAR
    <br />
    ESPORTS CLUB
  </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the most competitive gaming community in NIT Silchar. Level up your skills and dominate the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button size="lg" className="glow-primary group font-orbitron">
                View Events
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/members">
              <Button
                size="lg"
                variant="outline"
                className="font-orbitron border-primary/50 hover:bg-primary/10"
              >
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-orbitron text-4xl font-bold text-center mb-12 text-gradient">
            Why Join Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="glass-card border-primary/20 hover:border-primary/50 transition-all hover:glow-primary group"
              >
                <CardHeader>
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-orbitron text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-orbitron text-4xl font-bold mb-6 text-gradient">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community today and be part of the most exciting esports events in NIT Silchar.
          </p>
          <Link to="/about">
            <Button
              size="lg"
              variant="outline"
              className="font-orbitron border-primary/50 hover:bg-primary/10"
            >
              Learn More About Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
