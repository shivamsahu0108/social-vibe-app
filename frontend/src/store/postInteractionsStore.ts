import { create } from 'zustand';

interface PostInteraction {
  postId: string;
  isLiked: boolean;
  isSaved: boolean;
  likesCount: number;
  commentsCount: number;
}

interface PostInteractionsState {
  interactions: Record<string, PostInteraction>;
  
  // Actions
  toggleLike: (postId: string, initialLikes: number) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string) => void;
  getInteraction: (postId: string, initialLikes: number, initialComments: number) => PostInteraction;
}

export const usePostInteractionsStore = create<PostInteractionsState>((set, get) => ({
  interactions: {},

  toggleLike: (postId: string, initialLikes: number) => {
    set((state) => {
      const current = state.interactions[postId] || {
        postId,
        isLiked: false,
        isSaved: false,
        likesCount: initialLikes,
        commentsCount: 0,
      };

      return {
        interactions: {
          ...state.interactions,
          [postId]: {
            ...current,
            isLiked: !current.isLiked,
            likesCount: current.isLiked 
              ? current.likesCount - 1 
              : current.likesCount + 1,
          },
        },
      };
    });
  },

  toggleSave: (postId: string) => {
    set((state) => {
      const current = state.interactions[postId] || {
        postId,
        isLiked: false,
        isSaved: false,
        likesCount: 0,
        commentsCount: 0,
      };

      return {
        interactions: {
          ...state.interactions,
          [postId]: {
            ...current,
            isSaved: !current.isSaved,
          },
        },
      };
    });
  },

  addComment: (postId: string) => {
    set((state) => {
      const current = state.interactions[postId] || {
        postId,
        isLiked: false,
        isSaved: false,
        likesCount: 0,
        commentsCount: 0,
      };

      return {
        interactions: {
          ...state.interactions,
          [postId]: {
            ...current,
            commentsCount: current.commentsCount + 1,
          },
        },
      };
    });
  },

  getInteraction: (postId: string, initialLikes: number, initialComments: number) => {
    const state = get();
    return state.interactions[postId] || {
      postId,
      isLiked: false,
      isSaved: false,
      likesCount: initialLikes,
      commentsCount: initialComments,
    };
  },
}));
