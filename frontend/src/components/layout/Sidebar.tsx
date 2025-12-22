import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Film,
  MessageCircle,
  Bell,
  PlusSquare,
  Settings,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, useNotificationStore } from "@/store";
import { useChatStore } from "@/store/chatStore";

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (user) {
      fetchUnreadCount(user.id);
    }
  }, [user, fetchUnreadCount]);

  const conversations = useChatStore((s) => s.conversations);
  const unreadMessagesCount = conversations.filter(
    (c) =>
      c.lastMessage &&
      !c.lastMessage.isRead &&
      c.lastMessage.senderId !== user?.id
  ).length;

  const navItems = [
    { icon: Home, path: "/", label: "Home", badge: null },
    { icon: Search, path: "/search", label: "Search", badge: null },

    { icon: Film, path: "/reels", label: "Reels", badge: null },
    {
      icon: MessageCircle,
      path: "/chat",
      label: "Messages",
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
    },
    {
      icon: Bell,
      path: "/notifications",
      label: "Notifications",
      badge: unreadCount > 0 ? unreadCount : null,
    },

    { icon: PlusSquare, path: "/create", label: "Create", badge: null },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 hidden lg:flex">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <span className="text-white font-black text-xl">V</span>
          </div>
          <span className="text-2xl font-black tracking-tight bg-linear-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            VibeShare
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 px-4 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-linear-to-r from-pink-500/10 to-purple-500/10 text-pink-500 font-semibold shadow-sm"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn("h-6 w-6 mr-4", isActive && "stroke-[2.5]")}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "ml-auto px-2 py-0.5 rounded-full text-xs font-bold",
                      typeof item.badge === "number"
                        ? "bg-pink-500 text-white"
                        : "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <Link to="/profile">
          <Button
            variant="ghost"
            className="w-full justify-start h-16 px-4 rounded-xl hover:bg-accent transition-all"
          >
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-pink-500/20">
                <AvatarImage
                  src={user?.profilePic || "https://github.com/shadcn.png"}
                />
                <AvatarFallback>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"></div>
            </div>
            <div className="ml-3 flex-1 text-left">
              <p className="text-sm font-semibold">{user?.name || "Guest"}</p>
              <p className="text-xs text-muted-foreground">
                @{user?.username || "guest"}
              </p>
            </div>
          </Button>
        </Link>
        <Link to="/settings" className="mt-2 block">
          <Button
            variant="outline"
            className="w-full justify-start h-10 px-4 rounded-xl hover:bg-accent"
          >
            <Settings className="h-4 w-4 mr-3" />
            <span className="text-sm">Settings</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
