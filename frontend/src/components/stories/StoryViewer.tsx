import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useStoryStore } from "@/store";
import { cn } from "@/lib/utils";

const STORY_DURATION = 5000; // 5 seconds per story

export function StoryViewer() {
  const {
    activeStoryGroupIndex,
    activeStoryIndex,
    storyGroups,
    setActiveStoryIndex,
    setActiveStoryGroup,
    resetStoryViewer,
    markAsSeen,
  } = useStoryStore();

  const [progress, setProgress] = useState(0);

  const isOpen = activeStoryGroupIndex !== null;
  const storyGroup = isOpen ? storyGroups[activeStoryGroupIndex] : null;
  const currentStory = storyGroup?.stories[activeStoryIndex];

  // Auto-progress timer
  useEffect(() => {
    if (!isOpen || !currentStory) return;

    setProgress(0);
    markAsSeen(currentStory.id);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (STORY_DURATION / 100);
        if (newProgress >= 100) {
          handleNext();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeStoryIndex, activeStoryGroupIndex]);

  const handleNext = useCallback(() => {
    if (!storyGroup) return;

    if (activeStoryIndex < storyGroup.stories.length - 1) {
      // Next story in same group
      setActiveStoryIndex(activeStoryIndex + 1);
    } else if (activeStoryGroupIndex! < storyGroups.length - 1) {
      // Next story group
      setActiveStoryGroup(activeStoryGroupIndex! + 1);
    } else {
      // End of stories
      handleClose();
    }
  }, [
    storyGroup,
    activeStoryIndex,
    activeStoryGroupIndex,
    setActiveStoryIndex,
    setActiveStoryGroup,
  ]);

  const handlePrevious = useCallback(() => {
    if (!storyGroup) return;

    if (activeStoryIndex > 0) {
      // Previous story in same group
      setActiveStoryIndex(activeStoryIndex - 1);
    } else if (activeStoryGroupIndex! > 0) {
      // Previous story group (last story)
      const prevGroupIndex = activeStoryGroupIndex! - 1;
      const prevGroup = storyGroups[prevGroupIndex];
      setActiveStoryGroup(prevGroupIndex);
      setActiveStoryIndex(prevGroup.stories.length - 1);
    }
  }, [
    storyGroup,
    activeStoryIndex,
    activeStoryGroupIndex,
    setActiveStoryIndex,
    setActiveStoryGroup,
  ]);

  const handleClose = () => {
    resetStoryViewer();
    setProgress(0);
  };

  const handleTapLeft = () => {
    handlePrevious();
  };

  const handleTapRight = () => {
    handleNext();
  };

  if (!isOpen || !storyGroup || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Story Media */}
      {currentStory.type === "video" ? (
        <video
          src={currentStory.video || undefined}
          className="absolute inset-0 w-full h-full object-contain"
          autoPlay
          muted
          playsInline
        />
      ) : (
        <img
          src={currentStory.image || undefined}
          alt="Story"
          className="absolute inset-0 w-full h-full object-contain"
        />
      )}

      {/* Top Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 p-3 pt-4 flex space-x-1.5 z-20">
        {storyGroup.stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className={cn(
                "h-full bg-white transition-all ease-linear",
                index === activeStoryIndex ? "duration-100" : ""
              )}
              style={{
                width:
                  index < activeStoryIndex
                    ? "100%"
                    : index === activeStoryIndex
                    ? `${progress}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 px-3 py-2 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 ring-1 ring-white/50">
            <AvatarImage src={currentStory.userAvatar} />
            <AvatarFallback>{currentStory.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-white font-semibold text-sm drop-shadow-md leading-none mb-0.5">
              {currentStory.username}
            </p>
            <p className="text-white/70 text-[11px] drop-shadow-md leading-none">
              {Math.floor(
                (Date.now() - currentStory.timestamp.getTime()) /
                  (1000 * 60 * 60)
              )}
              h ago
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white hover:bg-white/10 w-10 h-10"
        >
          <X className="h-7 w-7" />
        </Button>
      </div>

      {/* Navigation Areas */}
      <div className="absolute inset-0 flex">
        {/* Left tap area */}
        <div className="flex-1 cursor-pointer" onClick={handleTapLeft} />
        {/* Right tap area */}
        <div className="flex-1 cursor-pointer" onClick={handleTapRight} />
      </div>

      {/* Navigation Buttons (Desktop) */}
      {activeStoryIndex > 0 || activeStoryGroupIndex! > 0 ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hidden md:flex"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      ) : null}

      {activeStoryIndex < storyGroup.stories.length - 1 ||
      activeStoryGroupIndex! < storyGroups.length - 1 ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hidden md:flex"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      ) : null}
    </div>
  );
}
