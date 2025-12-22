import { toast } from "sonner";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { useAuthStore } from "@/store";
import { useNotificationStore } from "@/store/notificationStore";
import { notificationService } from "@/api/notification.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const getIcon = (type: string) => {
  switch (type) {
    case "LIKE":
      return <Heart className="h-3 w-3 fill-white text-white" />;
    case "COMMENT":
      return <MessageCircle className="h-3 w-3 fill-white text-white" />;
    case "FOLLOW":
      return <UserPlus className="h-3 w-3 fill-white text-white" />;
    case "MESSAGE":
      return <MessageCircle className="h-3 w-3 fill-white text-white" />;
    default:
      return <Bell className="h-3 w-3 fill-white text-white" />;
  }
};

const getIconBg = (type: string) => {
  switch (type) {
    case "LIKE":
      return "bg-rose-500 shadow-rose-500/50";
    case "COMMENT":
      return "bg-blue-500 shadow-blue-500/50";
    case "FOLLOW":
      return "bg-purple-500 shadow-purple-500/50";
    case "MESSAGE":
      return "bg-blue-600 shadow-blue-600/50";
    default:
      return "bg-orange-500 shadow-orange-500/50";
  }
};

const playNotificationSound = () => {
  const audio = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"
  );
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const incrementUnread = useNotificationStore((s) => s.incrementUnread);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Real-time notification listener
    const unsubscribe = notificationService.subscribe(
      user.id,
      (notification) => {
        if (notification.type !== "MESSAGE") {
          incrementUnread();
        }

        playNotificationSound();

        // Premium Custom Toast
        toast.custom((t) => (
          <div
            className="group flex items-start gap-4 w-full p-4 rounded-2xl border border-white/20 bg-white/80 dark:bg-black/60 backdrop-blur-xl shadow-2xl shadow-black/10 hover:shadow-primary/5 cursor-pointer hover:bg-white/90 dark:hover:bg-black/80 transition-all duration-300 active:scale-98"
            onClick={() => {
              if (notification.type === "MESSAGE") {
                navigate("/chat");
              } else {
                navigate("/notifications");
              }
              toast.dismiss(t);
            }}
          >
            {/* Avatar Section */}
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10 border border-white/20 shadow-md ring-2 ring-background">
                <AvatarImage
                  src={`https://i.pravatar.cc/150?u=${notification.actorId}`}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {notification.actorUsername?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-background shadow-lg",
                  getIconBg(notification.type)
                )}
              >
                {getIcon(notification.type)}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col gap-1 pt-0.5">
              <div className="flex items-center justify-between pl-1">
                <span className="text-sm font-bold text-foreground tracking-tight">
                  {notification.actorUsername}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium opacity-70">
                  Now
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-snug pl-1 line-clamp-2">
                {notification.message}
              </p>
            </div>
          </div>
        ));
      }
    );

    return () => unsubscribe();
  }, [user, incrementUnread, navigate]);
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen pb-16 lg:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
