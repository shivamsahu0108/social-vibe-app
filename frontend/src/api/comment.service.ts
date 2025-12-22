import { apiFetch } from "./client";

export interface CommentResponse {
  id: number;
  text: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    profilePic: string | null;
  };
}

export interface CommentRequest {
  postId: number;
  userId: number;
  text: string;
}

export const commentService = {
  getComments: async (postId: number): Promise<CommentResponse[]> => {
    return apiFetch<CommentResponse[]>(`/api/comments/${postId}`);
  },

  addComment: async (data: CommentRequest): Promise<CommentResponse> => {
    return apiFetch<CommentResponse>("/api/comments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteComment: async (commentId: number, userId: number): Promise<string> => {
    return apiFetch<string>(`/api/comments/${commentId}?userId=${userId}`, {
      method: "DELETE",
    });
  },
};
