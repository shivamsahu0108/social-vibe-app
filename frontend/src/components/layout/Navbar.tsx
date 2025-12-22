import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Compass,
  Film,
  Heart,
  Home,
  MessageCircle,
  Search,
  User,
} from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-border/40 bg-background/80 sticky top-0 z-50 backdrop-blur-md supports-backdrop-filter:bg-background/60 transition-all">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Helper layout for mobile vs desktop */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight bg-linear-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"
          >
            VibeShare
          </Link>
        </div>

        {/* Desktop Search (hidden on mobile) */}
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search"
            className="w-full pl-8 h-9 rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Desktop Nav Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/reels">
            <Button variant="ghost" size="icon">
              <Film className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="ghost" size="icon">
              <Compass className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Link to="/chat">
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Theme Toggle (visible on mobile only) */}
        <div className="md:hidden">{/* Theme toggle moved to settings */}</div>
      </div>
    </nav>
  );
}
