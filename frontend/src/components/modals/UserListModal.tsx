import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { userService } from "@/api/user.service";
import { useAuthStore } from "@/store";
import type { UserResponseType } from "@/types/UserResponseType";

import { encodeId } from "@/lib/idEncoder";

interface UserListModalProps {
  userId: number;
  type: "followers" | "following";
  isOpen: boolean;
  onClose: () => void;
}

export function UserListModal({
  userId,
  type,
  isOpen,
  onClose,
}: UserListModalProps) {
  const [users, setUsers] = useState<UserResponseType[]>([]);
  const [loading, setLoading] = useState(false);
  const me = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const fetchUsers = async () => {
      try {
        const [data, myFollowingsData] = await Promise.all([
          type === "followers"
            ? userService.getFollowers(userId)
            : userService.getFollowings(userId),
          me ? userService.getFollowings(me.id) : Promise.resolve([]),
        ]);

        if (Array.isArray(data)) {
          // Create a Set of IDs that I follow
          const myFollowingIds = new Set(myFollowingsData.map((u) => u.id));

          // Hydrate the isFollowing status
          const enrichedData = data.map((u) => ({
            ...u,
            isFollowing: myFollowingIds.has(u.id),
          }));

          setUsers(enrichedData);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type, isOpen]);

  const handleFollow = async (targetId: number) => {
    try {
      await userService.follow(targetId);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, isFollowing: true } : u))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnfollow = async (targetId: number) => {
    try {
      await userService.unfollow(targetId);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, isFollowing: false } : u))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background border border-border rounded-xl shadow-2xl z-[100] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="w-8" /> {/* Spacer */}
          <h2 className="font-bold text-base capitalize">{type}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-sm">
              No users found.
            </div>
          ) : (
            <div className="flex flex-col">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  {/* User Info */}
                  <Link
                    to={`/profile/${encodeId(u.id)}`}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 overflow-hidden"
                  >
                    <Avatar className="h-11 w-11 border border-border shrink-0">
                      <AvatarImage src={u.profilePic || ""} />
                      <AvatarFallback>
                        {u.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-sm truncate">
                        {u.username}
                      </span>
                      {u.name && (
                        <span className="text-xs text-muted-foreground truncate">
                          {u.name}
                        </span>
                      )}
                    </div>
                  </Link>
                  {/* Action Button */}
                  {me && Number(me.id) !== Number(u.id) && (
                    <div className="ml-2">
                      {u.isFollowing ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 px-4 font-semibold"
                          onClick={() => handleUnfollow(u.id)}
                        >
                          Following
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="h-8 px-5 font-semibold bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handleFollow(u.id)}
                        >
                          Follow
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
}
