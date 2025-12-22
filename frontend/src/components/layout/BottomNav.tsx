import { Link, useLocation } from "react-router-dom";
import { Compass, Film, Home, PlusSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

export function BottomNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const navItems = [
    { icon: Home, path: "/" },
    { icon: Compass, path: "/explore" },
    { icon: PlusSquare, path: "/create" },
    { icon: Film, path: "/reels" },
    { icon: User, path: "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 h-16 px-6 pb-2 pt-2">
      <div className="flex justify-between items-center h-full">
        {navItems.map((item) => {
          const isProfile = item.path === "/profile";

          const isActive =
            location.pathname === item.path ||
            (isProfile && location.pathname.startsWith("/profile"));

          const to =
            isProfile && user
              ? `/profile/${user.id}`
              : item.path;

          return (
            <Link
              key={item.path}
              to={to}
              className="flex flex-col items-center justify-center w-12 h-full"
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-all",
                  isActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground"
                )}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
