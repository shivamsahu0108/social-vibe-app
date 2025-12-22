import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { encodeId } from "@/lib/idEncoder";
import { useAuthStore } from "@/store";
import { notificationService } from "@/api/notification.service";
import { userService } from "@/api/user.service";
import type { NotificationResponse } from "@/types/NotificationType";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const [followLoading, setFollowLoading] = useState<Set<number>>(new Set());

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    notificationService
      .getNotificationsForUser(user.id)
      .then((data) => {
        // Sort by date desc
        setNotifications(
          data
            .filter((n) => n.type !== "MESSAGE")
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Real-time subscription to update the list
    const unsubscribe = notificationService.subscribe(user.id, (newNotif) => {
      if (newNotif.type !== "MESSAGE") {
        setNotifications((prev) => [newNotif, ...prev]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Fetch my followings to know who I follow back
  useEffect(() => {
    if (!user) return;
    userService
      .getFollowings(user.id)
      .then((users) => {
        setFollowingIds(new Set(users.map((u) => u.id)));
      })
      .catch(console.error);
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, readFlag: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const handleFollow = async (actorId: number) => {
    if (followLoading.has(actorId)) return;
    setFollowLoading((prev) => new Set(prev).add(actorId));

    try {
      await userService.follow(actorId);
      setFollowingIds((prev) => new Set(prev).add(actorId));

      // Optional: Send notification back? Usually handled by backend or manual logic
      // In Profile.tsx manual logic was used.
      if (user) {
        notificationService
          .createAndSend({
            recipientId: actorId,
            actorId: user.id,
            type: "FOLLOW",
            message: "started following you",
          })
          .catch(console.error);
      }
    } catch (error) {
      console.error("Failed to follow", error);
    } finally {
      setFollowLoading((prev) => {
        const next = new Set(prev);
        next.delete(actorId);
        return next;
      });
    }
  };

  const handleUnfollow = async (actorId: number) => {
    if (followLoading.has(actorId)) return;
    setFollowLoading((prev) => new Set(prev).add(actorId));

    try {
      await userService.unfollow(actorId);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(actorId);
        return next;
      });
    } catch (error) {
      console.error("Failed to unfollow", error);
    } finally {
      setFollowLoading((prev) => {
        const next = new Set(prev);
        next.delete(actorId);
        return next;
      });
    }
  };

  const groupedNotifications = useMemo(() => {
    const now = new Date();
    const groups: Record<string, NotificationResponse[]> = {
      New: [],
      Today: [],
      "This Week": [],
      Earlier: [],
    };

    notifications.forEach((n) => {
      const date = new Date(n.createdAt);
      const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      const diffDays = diffHours / 24;

      if (diffHours < 24) groups["Today"].push(n);
      else if (diffDays < 7) groups["This Week"].push(n);
      else groups["Earlier"].push(n);
    });
    return groups;
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="h-4 w-4 fill-white text-white" />;
      case "COMMENT":
        return <MessageCircle className="h-4 w-4 fill-white text-white" />;
      case "FOLLOW":
        return <UserPlus className="h-4 w-4 fill-white text-white" />;
      default:
        return <Bell className="h-4 w-4 fill-white text-white" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "LIKE":
        return "bg-red-500";
      case "COMMENT":
        return "bg-blue-500";
      case "FOLLOW":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return `${Math.floor(diff / 604800)}w`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sections = ["Today", "This Week", "Earlier"];

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">Notifications</h1>
        {notifications.some((n) => !n.readFlag) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-blue-500 hover:text-blue-600"
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="pb-10">
        {" "}
        {/* Padding bottom for scroll */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Bell className="h-16 w-16 mb-4 stroke-1" />
            <p className="text-lg">No notifications yet</p>
          </div>
        ) : (
          sections.map((label) => {
            const items = groupedNotifications[label];
            if (!items || items.length === 0) return null;

            return (
              <div key={label}>
                <div className="px-4 py-3 font-semibold text-lg border-b border-border/50 bg-muted/20">
                  {label}
                </div>
                <div className="divide-y divide-border">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.readFlag) {
                          notificationService
                            .markAsRead(n.id)
                            .catch(console.error);
                          setNotifications((prev) =>
                            prev.map((x) =>
                              x.id === n.id ? { ...x, readFlag: true } : x
                            )
                          );
                        }
                      }}
                      className={cn(
                        "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                        !n.readFlag && "bg-blue-500/5"
                      )}
                    >
                      {/* Avatar + Icon Badge */}
                      <div className="relative">
                        <Link
                          to={`/profile/${encodeId(n.actorId)}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Avatar className="h-11 w-11 border border-border">
                            <AvatarImage
                              src={`https://i.pravatar.cc/150?u=${n.actorId}`}
                            />
                            <AvatarFallback>
                              {n.actorUsername?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-background",
                            getIconBg(n.type)
                          )}
                        >
                          {getIcon(n.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-sm">
                        <Link
                          to={`/profile/${encodeId(n.actorId)}`}
                          className="font-bold hover:underline mr-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {n.actorUsername}
                        </Link>
                        <span className="text-foreground/90">
                          {n.type === "LIKE" && "liked your post."}
                          {n.type === "COMMENT" && `commented: "${n.message}"`}
                          {n.type === "FOLLOW" && "started following you."}
                          {!["LIKE", "COMMENT", "FOLLOW"].includes(n.type) &&
                            n.message}
                        </span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {getTimeAgo(n.createdAt)}
                        </span>
                      </div>

                      {/* Right Action */}
                      {/* If Like/Comment -> Show Thumbnail */}
                      {n.type !== "FOLLOW" && n.sourceId && (
                        <Link
                          to={`/post/${encodeId(n.sourceId)}`}
                          className="shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="h-11 w-11 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground border border-border overflow-hidden">
                            <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200" />
                          </div>
                        </Link>
                      )}

                      {/* Special "Follow Back" UI style for Follows */}
                      {n.type === "FOLLOW" &&
                        (followingIds.has(n.actorId) ? (
                          <Button
                            size="sm"
                            disabled={followLoading.has(n.actorId)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnfollow(n.actorId);
                            }}
                            className="h-8 px-4 font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            variant="secondary"
                          >
                            Following
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={followLoading.has(n.actorId)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollow(n.actorId);
                            }}
                            className="h-8 px-4 font-semibold bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            Follow Back
                          </Button>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
