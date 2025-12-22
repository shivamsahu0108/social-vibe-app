import { useState, useEffect, useRef } from "react";
import { ReelCard } from "@/components/reels/ReelCard";
import { ShareModal } from "@/components/modals/ShareModal";
import { CommentsDrawer } from "@/components/modals/CommentsDrawer";
import { postService } from "@/api/post.service";
import type { PostResponseType } from "@/types/PostResponseType";

export default function Reels() {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [reels, setReels] = useState<PostResponseType[]>([]);
  const [loading, setLoading] = useState(true);
  console.log("reels", reels);
  useEffect(() => {
    postService
      .getReels()
      .then((data) => {
        setReels(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Handle scroll to detect active reel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const reelHeight = window.innerHeight;
      const newIndex = Math.round(scrollPosition / reelHeight);
      setActiveReelIndex(newIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {reels.map((reel, index) => (
          <ReelCard
            key={reel.id}
            reel={{
              id: reel.id.toString(),
              videoUrl: reel.videoUrl || "",
              thumbnail: reel.imageUrl || "",
              username: reel.username,
              userAvatar: `https://i.pravatar.cc/150?u=${reel.userId}`,
              verified: false,
              caption: reel.content,
              likes: reel.likeCount,
              comments: 0,
              shares: 0,
              views: reel.viewCount.toString(),
              userId: reel.userId,
              followed: reel.followed,
            }}
            isActive={index === activeReelIndex}
          />
        ))}
        {loading && (
          <div className="h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Modals */}
      <ShareModal />
      <CommentsDrawer />
    </>
  );
}
