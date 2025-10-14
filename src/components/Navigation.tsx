import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "Schedule", path: "/schedule" },
    { name: "Members", path: "/members" },
    { name: "About", path: "/about" },
    { name: "Admin", path: "/login" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-4 left-0 right-0 z-50">
      <div className="flex justify-center px-4">
        <div className="flex items-center w-full max-w-4xl rounded-full glass-card border border-border/40 px-3 py-2">

          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 px-2 group">
            <div>
              <img src={logo} alt="NIT Silchar Esports Logo" className="h-14 w-14 rounded-full object-cover" />
            </div>
            <span className="hidden sm:inline-block font-orbitron font-bold text-lg text-gradient">NIT SILCHAR ESPORTS</span>
          </Link>

          {/* Desktop Links (right) */}
          <div className="ml-auto hidden md:flex items-center gap-2">
            {links.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant={isActive(link.path) ? "default" : "ghost"}
                  className={`font-inter rounded-full px-3 ${isActive(link.path) ? "glow-primary" : ""}`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile menu toggle (inside capsule) */}
          <div className="md:hidden ml-auto">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground hover:text-primary transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation sheet (below capsule) */}
      {isOpen && (
        <div className="flex justify-center px-4 mt-3">
          <div className="w-full max-w-4xl bg-card glass-card rounded-xl border border-border/30 p-3 md:hidden">
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                  <Button variant={isActive(link.path) ? "default" : "ghost"} className="w-full justify-start">
                    {link.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
