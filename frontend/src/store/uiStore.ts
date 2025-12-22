import { create } from 'zustand';

interface UIState {
  // Modal states
  isShareModalOpen: boolean;
  isStoryViewerOpen: boolean;
  isCommentDrawerOpen: boolean;
  
  // Active items
  activePostId: string | null;
  activeStoryId: string | null;
  
  // Actions
  openShareModal: (postId: string) => void;
  closeShareModal: () => void;
  openStoryViewer: (storyId: string) => void;
  closeStoryViewer: () => void;
  openCommentDrawer: (postId: string) => void;
  closeCommentDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isShareModalOpen: false,
  isStoryViewerOpen: false,
  isCommentDrawerOpen: false,
  activePostId: null,
  activeStoryId: null,

  // Actions
  openShareModal: (postId: string) => 
    set({ isShareModalOpen: true, activePostId: postId }),
  
  closeShareModal: () => 
    set({ isShareModalOpen: false, activePostId: null }),
  
  openStoryViewer: (storyId: string) => 
    set({ isStoryViewerOpen: true, activeStoryId: storyId }),
  
  closeStoryViewer: () => 
    set({ isStoryViewerOpen: false, activeStoryId: null }),
  
  openCommentDrawer: (postId: string) => 
    set({ isCommentDrawerOpen: true, activePostId: postId }),
  
  closeCommentDrawer: () => 
    set({ isCommentDrawerOpen: false, activePostId: null }),
}));
