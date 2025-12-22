import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { encodeId } from "@/lib/idEncoder";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostInteractionsStore, useUIStore } from "@/store";

type PostProps = {
  id: number; // Changed from postId string to number to match PostResponseType usually, but Home uses string?
  // Actually Home uses 'postId' string and 'id' number.
  // Let's keep it flexible or check Home usage.
  // Home passes {...post}. post has 'id' (number) and 'postId' (string).
  // I'll add userId: number.
  userId: number;
  postId: string;
  username: string;
  userAvatar: string;
  verified?: boolean;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  location?: string;
  videoUrl?: string | null;
  type?: "POST" | "REEL" | "STORY";
};

export function PostCard({
  userId,
  postId,
  username,
  userAvatar,
  verified,
  image,
  caption,
  likes,
  comments,
  shares,
  timeAgo,
  location,
  videoUrl,
  type,
}: PostProps) {
  const isReel = type === "REEL";
  const { toggleLike, toggleSave, getInteraction } = usePostInteractionsStore();
  const { openShareModal, openCommentDrawer } = useUIStore();
  const interaction = getInteraction(postId, likes, comments);

  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const handleLike = () => {
    toggleLike(postId, likes);
    if (!interaction.isLiked) {
      // Show heart animation when liking
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }
  };

  const handleDoubleClick = () => {
    if (!interaction.isLiked) {
      handleLike();
    }
  };

  const handleSave = () => {
    toggleSave(postId);
  };

  const handleShare = () => {
    openShareModal(postId);
  };

  const handleCommentClick = () => {
    openCommentDrawer(postId);
  };

  return (
    <Card className="overflow-hidden border-2 hover:shadow-xl transition-all duration-300">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${encodeId(userId)}`}>
              <Avatar className="h-11 w-11 ring-2 ring-pink-500/20 cursor-pointer hover:ring-pink-500/40 transition-all">
                <AvatarImage src={userAvatar} />
                <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center space-x-1.5">
                <Link to={`/profile/${encodeId(userId)}`}>
                  <p className="font-bold text-sm hover:underline cursor-pointer">
                    {username}
                  </p>
                </Link>
                {verified && (
                  <svg
                    className="w-4 h-4 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              {location && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative group min-h-[400px]">
        {isReel && (
          <div className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md flex items-center space-x-1 border border-white/20">
            <svg
              className="w-3 h-3 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
            <span className="text-[10px] text-white font-bold uppercase tracking-wider">
              Reel
            </span>
          </div>
        )}
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            loop
            muted
            className="w-full aspect-square object-cover cursor-pointer"
            onDoubleClick={handleDoubleClick}
          />
        ) : (
          <img
            src={image}
            alt="Post"
            className="w-full aspect-square object-cover cursor-pointer"
            onDoubleClick={handleDoubleClick}
          />
        )}
        {/* Double-tap heart animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart
            className={cn(
              "h-24 w-24 text-white drop-shadow-2xl transition-all duration-500",
              showHeartAnimation
                ? "scale-100 opacity-100 animate-ping"
                : "scale-0 opacity-0"
            )}
            fill="white"
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start p-4 space-y-3">
        {/* Action Buttons */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 transition-all",
                interaction.isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "hover:text-red-500"
              )}
              onClick={handleLike}
            >
              <Heart
                className={cn("h-6 w-6", interaction.isLiked && "fill-current")}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:text-blue-500"
              onClick={handleCommentClick}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:text-green-500"
              onClick={handleShare}
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 transition-all",
              interaction.isSaved
                ? "text-yellow-500 hover:text-yellow-600"
                : "hover:text-yellow-500"
            )}
            onClick={handleSave}
          >
            <Bookmark
              className={cn("h-6 w-6", interaction.isSaved && "fill-current")}
            />
          </Button>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <button
            className="font-bold hover:text-pink-500 transition-colors"
            onClick={handleLike}
          >
            {interaction.likesCount.toLocaleString()} likes
          </button>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleCommentClick}
          >
            {interaction.commentsCount} comments
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            {shares} shares
          </button>
        </div>

        {/* Caption */}
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-semibold mr-2">{username}</span>
            {caption}
          </p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
