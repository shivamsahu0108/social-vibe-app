import { PostCard } from "@/components/home/PostCard";
import { StoryRail } from "@/components/home/StoryRail";
import { TrendingCard } from "@/components/home/TrendingCard";
import { ShareModal } from "@/components/modals/ShareModal";
import { CommentsDrawer } from "@/components/modals/CommentsDrawer";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { useNotificationStore } from "@/store";
import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { postService } from "@/api/post.service";
import type { PostResponseType } from "@/types/PostResponseType";

export default function Home() {
  const [feed, setFeed] = useState<PostResponseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService
      .getFeed()
      .then((data) => {
        setFeed(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}d ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center px-4 py-3 sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
          <h1 className="text-xl font-bold font-display bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            VibeShare
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative">
              <Heart className="h-6 w-6" />
              <NotificationBadge />
            </Link>
            <Link to="/chat">
              <MessageCircle className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Stories Section */}
        <div className="lg:sticky lg:top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
          <StoryRail />
        </div>

        {/* Main Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Posts Column */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full aspect-square bg-muted animate-pulse rounded-xl"
                />
              ))
            ) : feed.length > 0 ? (
              feed.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  userId={post.userId}
                  postId={post.id.toString()}
                  username={post.username}
                  userAvatar={`https://i.pravatar.cc/150?u=${post.userId}`}
                  image={
                    post.imageUrl ||
                    "https://placehold.co/600x600?text=No+Image"
                  }
                  videoUrl={post.videoUrl}
                  type={post.type}
                  caption={post.content}
                  likes={post.likeCount}
                  comments={0} // Todo: fetch comments count or add to response
                  shares={0}
                  timeAgo={getTimeAgo(post.createdAt)}
                  location=""
                  verified={false}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p>No posts yet. Follow someone to see their posts!</p>
              </div>
            )}
          </div>

          {/* Trending Sidebar */}
          <div className="hidden lg:block space-y-6">
            <TrendingCard />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal />
      <CommentsDrawer />
      <StoryViewer />
    </div>
  );
}

function NotificationBadge() {
  const { unreadCount } = useNotificationStore();
  if (unreadCount === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}
