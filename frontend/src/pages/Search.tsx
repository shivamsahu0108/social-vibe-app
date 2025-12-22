import { useEffect, useState } from "react";
import { encodeId } from "@/lib/idEncoder";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, X, TrendingUp, Clock, Hash } from "lucide-react";
import { userService } from "@/api/user.service";
import type { UserResponseType } from "@/types/UserResponseType";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store";
import { toast } from "sonner";

// Mock trending data - replace with actual API call
const TRENDING_TOPICS = [
  { tag: "photography", posts: "1.2M" },
  { tag: "travel", posts: "856K" },
  { tag: "food", posts: "643K" },
  { tag: "fitness", posts: "521K" },
  { tag: "art", posts: "498K" },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserResponseType[]>([]);
  const [recentSearches, setRecentSearches] = useState<UserResponseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { user: me } = useAuthStore();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recent searches", e);
      }
    }
  }, []);

  // Save to recent searches
  const addToRecentSearches = (user: UserResponseType) => {
    const updated = [
      user,
      ...recentSearches.filter((u) => u.id !== user.id),
    ].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Remove single recent search
  const removeRecentSearch = (userId: number) => {
    const updated = recentSearches.filter((u) => u.id !== userId);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleFollowToggle = async (
    e: React.MouseEvent,
    targetUser: UserResponseType
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!me) return;

    // Optimistic update
    const previousState = [...filteredUsers];
    const isFollowing = targetUser.isFollowing;

    setFilteredUsers((users) =>
      users.map((u) =>
        u.id === targetUser.id ? { ...u, isFollowing: !isFollowing } : u
      )
    );

    try {
      if (isFollowing) {
        await userService.unfollow(targetUser.id);
        toast.success(`Unfollowed ${targetUser.username}`);
      } else {
        await userService.follow(targetUser.id);
        toast.success(`Following ${targetUser.username}`);
      }
    } catch (error) {
      // Revert on failure
      setFilteredUsers(previousState);
      toast.error("Failed to update follow status");
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const users = await userService.setSearch(searchQuery);
        setFilteredUsers(users);
      } catch (error) {
        console.error("Search failed:", error);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showRecentSearches =
    isFocused && !searchQuery && recentSearches.length > 0;
  const showTrending = !searchQuery && !isFocused;
  const showResults = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Search</h1>
          <p className="text-sm text-muted-foreground">
            Discover people and content
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="pl-12 pr-12 h-12 rounded-xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilteredUsers([]);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Recent Searches */}
        {showRecentSearches && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-semibold text-sm">Recent</h2>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <Link
                    to={`/profile/${encodeId(user.id)}`}
                    className="flex items-center gap-3 flex-1"
                    onClick={() => addToRecentSearches(user)}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {user.username}
                      </p>
                      {user.name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.name}
                        </p>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => removeRecentSearch(user.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {showResults && (
          <div className="space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              </div>
            )}

            {!loading && filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-semibold mb-1">No results found</p>
                <p className="text-sm text-muted-foreground text-center">
                  Try searching for people, usernames, or topics
                </p>
              </div>
            )}

            {!loading && filteredUsers.length > 0 && (
              <>
                <div className="px-2 mb-3">
                  <h2 className="font-semibold text-sm text-muted-foreground">
                    {filteredUsers.length} result
                    {filteredUsers.length !== 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <Link
                      to={`/profile/${encodeId(user.id)}`}
                      key={user.id}
                      onClick={() => addToRecentSearches(user)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 ring-1 ring-border/50">
                          <AvatarImage src={user.profilePic || "/avatar.png"} />
                          <AvatarFallback className="text-sm font-semibold">
                            {user.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {user.username}
                          </p>
                          {user.name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {user.name}
                            </p>
                          )}
                          {user.followersCount !== undefined && (
                            <p className="text-xs text-muted-foreground">
                              {user.followersCount} followers
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={user.isFollowing ? "secondary" : "default"}
                        className={
                          user.isFollowing
                            ? "rounded-lg px-6 font-semibold"
                            : "bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 font-semibold"
                        }
                        onClick={(e) => handleFollowToggle(e, user)}
                      >
                        {user.isFollowing ? "Following" : "Follow"}
                      </Button>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Trending Section */}
        {showTrending && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold">Trending now</h2>
            </div>
            <div className="space-y-1">
              {TRENDING_TOPICS.map((topic, index) => (
                <button
                  key={topic.tag}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                        <Hash className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">#{topic.tag}</p>
                        <p className="text-xs text-muted-foreground">
                          {topic.posts} posts
                        </p>
                      </div>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>

            {/* Explore More */}
            <div className="mt-8 p-6 bg-linear-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-lg">🔍</span>
                Explore more
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Discover new people, trending topics, and interesting content
                tailored for you.
              </p>
              <Button
                variant="secondary"
                className="w-full rounded-lg font-semibold"
              >
                Browse Explore
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
