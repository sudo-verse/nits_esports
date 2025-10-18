import { Gamepad2, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="glass-card border-t border-border/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <span className="font-orbitron font-bold text-lg text-gradient">
                NIT SILCHAR
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Official esports club of NIT Silchar. Join the competition.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-orbitron font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Events
                </Link>
              </li>
           
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-orbitron font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/members" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Members
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-orbitron font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                NIT Silchar, Assam
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:esports.nits@gmail.com">esports.nits@gmail.com</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+918434307257">+91 84343 07257</a>
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+918252445506">+91 82524 45506</a>
                
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NIT Silchar Esports Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
