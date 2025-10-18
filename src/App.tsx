import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Schedule from "./pages/Schedule";
import Members from "./pages/Members";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import EventLeaderboard from "./pages/EventLeaderboard";
import LockLoad from "./pages/LockLoad";
import EventSchedule from "./pages/EventSchedule";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import RequireAuth from "./auth/RequireAuth";

const queryClient = new QueryClient();

function MainRoutes() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <main className={`flex-1 ${isHome ? "pt-0" : "pt-16"}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId/leaderboard" element={<EventLeaderboard />} />
        <Route path="/events/:eventId/leaderboard/:gameId" element={<EventLeaderboard />} />
        <Route path="/events/lock-load" element={<LockLoad />} />
         <Route path="/events/:eventId/schedule" element={<EventSchedule />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/members" element={<Members />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <MainRoutes />
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
