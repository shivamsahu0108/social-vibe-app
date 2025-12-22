import { create } from "zustand";
import type { StoryGroup } from "@/data/mockStories";

interface StoryState {
  seenStories: Set<string>;
  activeStoryGroupIndex: number | null;
  activeStoryIndex: number;
  storyGroups: StoryGroup[];

  // Actions
  markAsSeen: (storyId: string) => void;
  isStorySeen: (storyId: string) => boolean;
  setActiveStoryGroup: (index: number | null) => void;
  setActiveStoryIndex: (index: number) => void;
  setStoryGroups: (groups: StoryGroup[]) => void;
  resetStoryViewer: () => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  seenStories: new Set<string>(),
  activeStoryGroupIndex: null,
  activeStoryIndex: 0,
  storyGroups: [],

  markAsSeen: (storyId: string) => {
    set((state) => ({
      seenStories: new Set(state.seenStories).add(storyId),
    }));
  },

  isStorySeen: (storyId: string) => {
    return get().seenStories.has(storyId);
  },

  setActiveStoryGroup: (index: number | null) => {
    set({ activeStoryGroupIndex: index, activeStoryIndex: 0 });
  },

  setActiveStoryIndex: (index: number) => {
    set({ activeStoryIndex: index });
  },

  setStoryGroups: (groups: StoryGroup[]) => {
    set({ storyGroups: groups });
  },

  resetStoryViewer: () => {
    set({ activeStoryGroupIndex: null, activeStoryIndex: 0 });
  },
}));
