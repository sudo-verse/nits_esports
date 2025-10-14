import { Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import valorantImg from "@/assets/valorant.jpg";
import bgmiImg from "@/assets/bgmi.jpg";
import codImg from "@/assets/cod.jpg";
import mlImg from "@/assets/ml.jpg";
import freefireImg from "@/assets/freefire.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// ... other imports


const games = [
  { id: "bgmi", name: "BGMI", image: bgmiImg },
  { id: "codm", name: "COD Mobile", image: codImg },
  { id: "valorant", name: "Valorant", image: valorantImg },
  { id: "ml", name: "Mobile Legends", image: mlImg },
  { id: "freefire", name: "Free Fire", image: freefireImg },
];


const LockLoad = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000); // hide after 3s
  };

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      {/* Hero banner */}
      <div className="w-full px-4">
        <div className="mx-auto rounded-xl overflow-hidden shadow-xl max-w-[1400px]">
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2Fb08a719e7a5748bd857bfb0fe32be8a0?format=webp&width=1600"
              alt="Lock & Load banner"
              className="w-full h-72 md:h-80 lg:h-96 object-cover brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-6 py-8 text-center">
                <h1 className="font-orbitron text-4xl md:text-6xl font-bold text-white">Lock & Load</h1>
                <p className="mt-2 text-white/90 max-w-2xl mx-auto drop-shadow-md">
                  A fast-paced multi-game tournament featuring top clubs across multiple titles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Games grid */}
      <div className="container mx-auto px-4 mt-8">
        <h2 className="font-orbitron text-2xl font-bold mb-6">Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g) => (
            <Card key={g.id} className="glass-card overflow-hidden">
              <div className="relative h-40">
                <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
              </div>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="font-orbitron">{g.name}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Prize pool: <span className="font-orbitron font-semibold">₹2,000</span>
                </div>
              </CardHeader>
              <CardContent>
              <div>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="font-orbitron text-center">Coming Soon!</DialogTitle>
    </DialogHeader>
    <div className="py-4 text-center text-muted-foreground">
      <p>The leaderboard for this game is not prepared yet. Please check back later.</p>
    </div>
  </DialogContent>
</Dialog>
  {g.id === 'bgmi' || g.id === 'freefire'  ? (
    <Link to={`/events/lock-load/leaderboard/${g.id}`}>
      <Button variant="outline" className="w-full font-orbitron">
        View Leaderboard
      </Button>
    </Link>
  ) : (
    <Button
      variant="outline"
      className="w-full font-orbitron"
      onClick={() => setIsModalOpen(true)}
    >
      View Leaderboard
    </Button>
  )}
</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-yellow-400 text-black px-5 py-3 rounded-lg shadow-lg animate-fade-in-out z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default LockLoad;
