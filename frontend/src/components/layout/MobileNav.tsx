import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore, useNotificationStore } from "@/store";

export function MobileNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    // Ensure we have the count even if Sidebar isn't mounted/active
    if (user) {
      fetchUnreadCount(user.id);
    }
  }, [user, fetchUnreadCount]);

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Search, path: "/search", label: "Search" },
    { icon: PlusSquare, path: "/create", label: "Create" },

    { icon: Film, path: "/reels", label: "Reels" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden px-4 py-2 pb-safe">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "p-2 rounded-lg transition-colors relative",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6",
                  isActive && "fill-current stroke-none"
                )}
              />

              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}

        {/* Profile Link */}
        <Link to="/profile">
          <div
            className={cn(
              "p-0.5 rounded-full border-2 transition-colors",
              location.pathname === "/profile"
                ? "border-foreground"
                : "border-transparent"
            )}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.profilePic || undefined} />
              <AvatarFallback className="text-[10px]">
                {user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </Link>
      </div>
    </div>
  );
}
