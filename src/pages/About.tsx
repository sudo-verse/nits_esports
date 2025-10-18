import { Target, Zap, Heart, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
const About = () => {
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for excellence in every game we play and every tournament we host.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Embracing new gaming technologies and strategies to stay ahead of the curve.",
    },
    {
      icon: Heart,
      title: "Community",
      description: "Building a supportive and inclusive community for all gaming enthusiasts.",
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "Maintaining fair play, sportsmanship, and ethical gaming practices.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-orbitron text-5xl font-bold mb-4 text-gradient">
            About Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The official esports club of NIT Silchar, dedicated to fostering competitive gaming excellence
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <Card className="glass-card border-primary/20 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-8">
              <h2 className="font-orbitron text-3xl font-bold mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-center max-w-4xl mx-auto leading-relaxed">
                To create a thriving esports ecosystem at NIT Silchar that nurtures talent, promotes competitive gaming,
                and builds a strong community of passionate gamers. We aim to provide a platform where students can
                develop their skills, compete at the highest level, and represent our institution in national and
                international esports tournaments.
              </p>
            </div>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="font-orbitron text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="glass-card border-primary/20 hover:border-primary/50 transition-all hover:glow-primary group text-center"
              >
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="font-orbitron text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section className="mb-16">
          <h2 className="font-orbitron text-3xl font-bold mb-8 text-center">Our Journey</h2>
          <Card className="glass-card border-primary/20">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-20 font-orbitron font-bold text-primary">2025</div>
                  <div>
                    <h3 className="font-orbitron font-semibold text-lg mb-2">Club Foundation</h3>
                    <p className="text-muted-foreground">
                      The NIT Silchar Esports Club was officially established with 10 founding members passionate
                      about competitive gaming.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-20 font-orbitron font-bold text-secondary">2025</div>
                  <div>
                    <h3 className="font-orbitron font-semibold text-lg mb-2">First Major Tournament</h3>
                    <p className="text-muted-foreground">
                      Hosted our first inter-college esports tournament with over 200+ participants from across the
                      region, establishing ourselves as a major player in the collegiate esports scene.
                    </p>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section>
          <Card className="glass-card border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
            <CardContent className="p-8">
              <h2 className="font-orbitron text-3xl font-bold mb-6 text-center">Get in Touch</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground"><a href="mailto:esports.nits@gmail.com">esports.nits@gmail.com</a></p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">NIT Silchar, Assam, India</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-muted-foreground"><a href="tel:+918434307257"></a>+91 84343 07257</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Social Media</h3>
                  <p className="text-muted-foreground"><Link to={"https://www.instagram.com/nits.esports/"}>esports@nits</Link></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
