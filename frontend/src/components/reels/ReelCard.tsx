import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { encodeId } from "@/lib/idEncoder";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostInteractionsStore, useUIStore, useAuthStore } from "@/store";
import { userService } from "@/api/user.service";
import type { Reel } from "@/data/mockReels";
import { toast } from "sonner";

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
}

export function ReelCard({ reel, isActive }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  const { toggleLike, toggleSave, getInteraction } = usePostInteractionsStore();
  const { openShareModal, openCommentDrawer } = useUIStore();
  const { user: me } = useAuthStore();

  const interaction = getInteraction(reel.id, reel.likes, reel.comments);
  const [isFollowing, setIsFollowing] = useState(reel.followed || false);
  const [followLoading, setFollowLoading] = useState(false);
  const handleFollowToggle = async () => {
    if (!me) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollow(Number(reel.userId)); // Assuming we have userId in data
        setIsFollowing(false);
        toast.success(`Unfollowed ${reel.username}`);
      } else {
        await userService.follow(Number(reel.userId));
        setIsFollowing(true);
        toast.success(`Following ${reel.username}`);
      }
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  // Auto-play when reel becomes active
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Auto-play failed, user needs to interact
            setIsPlaying(false);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }

      // Show play/pause icon briefly
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 500);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleLike = () => {
    toggleLike(reel.id, reel.likes);
  };

  const handleSave = () => {
    toggleSave(reel.id);
  };

  const handleShare = () => {
    openShareModal(reel.id);
  };

  return (
    <div className="relative h-screen w-full snap-start snap-always bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl || undefined}
        poster={reel.thumbnail || undefined}
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        onClick={handleVideoClick}
      />

      {/* Play/Pause Icon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {showPlayIcon && (
          <div className="bg-black/50 rounded-full p-6 animate-in zoom-in-50 fade-in duration-200">
            {isPlaying ? (
              <Pause className="h-16 w-16 text-white" fill="white" />
            ) : (
              <Play className="h-16 w-16 text-white" fill="white" />
            )}
          </div>
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <Link
            to={`/profile/${encodeId(reel.userId || 0)}`}
            className="flex items-center space-x-2"
          >
            <Avatar className="h-10 w-10 ring-2 ring-white/20">
              <AvatarImage src={reel.userAvatar} />
              <AvatarFallback>{reel.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-white font-semibold text-sm drop-shadow-lg">
                  {reel.username}
                </span>
                {reel.verified && (
                  <svg
                    className="w-4 h-4 text-blue-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
          </Link>
          {me?.id !== Number(reel.userId) && (
            <Button
              size="sm"
              variant={isFollowing ? "secondary" : "default"}
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={cn(
                "h-7 px-3 text-white border border-white/30 backdrop-blur-sm transition-all",
                isFollowing
                  ? "bg-white/20 hover:bg-white/30"
                  : "bg-blue-600/80 hover:bg-blue-600 border-none"
              )}
            >
              {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Right Action Buttons */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 z-10">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center space-y-1 group"
        >
          <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
            <Heart
              className={cn(
                "h-7 w-7 transition-all",
                interaction.isLiked ? "text-red-500 fill-current" : "text-white"
              )}
            />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            {interaction.likesCount > 999
              ? `${(interaction.likesCount / 1000).toFixed(1)}K`
              : interaction.likesCount}
          </span>
        </button>

        {/* Comment */}
        <button
          onClick={() => openCommentDrawer(reel.id)}
          className="flex flex-col items-center space-y-1 group"
        >
          <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            {reel.comments > 999
              ? `${(reel.comments / 1000).toFixed(1)}K`
              : reel.comments}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center space-y-1 group"
        >
          <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            {reel.shares}
          </span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex flex-col items-center space-y-1 group"
        >
          <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
            <Bookmark
              className={cn(
                "h-7 w-7 transition-all",
                interaction.isSaved
                  ? "text-yellow-400 fill-current"
                  : "text-white"
              )}
            />
          </div>
        </button>

        {/* Mute/Unmute */}
        <button
          onClick={handleMuteToggle}
          className="flex flex-col items-center space-y-1 group"
        >
          <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
            {isMuted ? (
              <VolumeX className="h-7 w-7 text-white" />
            ) : (
              <Volume2 className="h-7 w-7 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 space-y-2 z-10">
        <p className="text-white text-sm drop-shadow-lg line-clamp-2">
          {reel.caption}
        </p>
        <div className="flex items-center space-x-4 text-white/80 text-xs">
          <span className="drop-shadow-lg">{reel.views} views</span>
        </div>
      </div>
    </div>
  );
}
