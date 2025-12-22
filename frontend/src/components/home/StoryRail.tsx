import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useStoryStore, useAuthStore } from "@/store";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { postService } from "@/api/post.service";
import { useNavigate } from "react-router-dom";
import type { StoryGroup, Story } from "@/data/mockStories";

export function StoryRail() {
  const { storyGroups, setStoryGroups, setActiveStoryGroup, isStorySeen } =
    useStoryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    postService.getStories().then((posts) => {
      // Group posts by user
      const groups: Record<string, StoryGroup> = {};

      posts.forEach((post) => {
        const userId = post.userId.toString();
        if (!groups[userId]) {
          groups[userId] = {
            userId: userId,
            username: post.username,
            userAvatar: `https://i.pravatar.cc/150?u=${post.userId}`,
            stories: [],
            hasUnseenStories: false,
          };
        }

        const hasVideo = !!post.videoUrl;
        const story: Story = {
          id: post.id.toString(),
          userId: userId,
          username: post.username,
          userAvatar: `https://i.pravatar.cc/150?u=${post.userId}`,
          image: post.imageUrl || undefined,
          video: post.videoUrl || undefined,
          type: hasVideo ? "video" : "image",
          timestamp: new Date(post.createdAt),
        };

        groups[userId].stories.push(story);
        if (!isStorySeen(story.id)) {
          groups[userId].hasUnseenStories = true;
        }
      });

      // Sort: Own story first (if exists), then alphabetical or by recency
      const result = Object.values(groups);
      setStoryGroups(result);
    });
  }, [setStoryGroups, isStorySeen]);

  const handleStoryClick = (index: number) => {
    setActiveStoryGroup(index);
  };

  const handleCreateStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/create?type=STORY");
  };

  return (
    <div className="w-full py-4 px-4">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {storyGroups.map((storyGroup, index) => {
          const isOwn = storyGroup.userId === user?.id?.toString();
          const allSeen = storyGroup.stories.every((story) =>
            isStorySeen(story.id)
          );
          const hasUnseen = !allSeen;

          return (
            <div
              key={storyGroup.userId}
              className="flex flex-col items-center space-y-2 cursor-pointer group shrink-0"
              onClick={() => handleStoryClick(index)}
            >
              <div className="relative">
                {isOwn ? (
                  <div className="relative">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-2 ring-border transition-all group-hover:ring-pink-500/50">
                      <AvatarImage
                        src={storyGroup.userAvatar}
                        alt={storyGroup.username}
                      />
                      <AvatarFallback>{storyGroup.username[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      onClick={handleCreateStory}
                      className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-linear-to-br from-pink-500 to-purple-500 flex items-center justify-center ring-2 ring-background hover:scale-110 transition-transform"
                    >
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "p-[2px] rounded-full transition-transform group-hover:scale-110",
                      hasUnseen
                        ? "bg-linear-to-tr from-pink-500 via-purple-500 to-orange-500"
                        : "bg-border"
                    )}
                  >
                    <div className="bg-background p-[3px] rounded-full">
                      <Avatar className="h-14 w-14 md:h-16 md:w-16">
                        <AvatarImage
                          src={storyGroup.userAvatar}
                          alt={storyGroup.username}
                        />
                        <AvatarFallback>
                          {storyGroup.username[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-foreground/80 truncate w-20 text-center group-hover:text-pink-500 transition-colors">
                {isOwn ? "Your Story" : storyGroup.username}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
