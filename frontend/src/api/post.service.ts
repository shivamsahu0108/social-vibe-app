import type { PostResponseType } from "@/types/PostResponseType";
import { apiFetch } from "./client";

export const postService = {
  /* ================= CREATE ================= */

  createImagePost: (content: string, file: File, type: string = "POST") => {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("type", type);
    formData.append("file", file);

    return apiFetch<PostResponseType>("/api/posts/with-image", {
      method: "POST",
      body: formData,
    });
  },

  createVideoPost: (content: string, file: File, type: string = "REEL") => {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("type", type);
    formData.append("file", file);

    return apiFetch<PostResponseType>("/api/posts/with-video", {
      method: "POST",
      body: formData,
    });
  },

  /* ================= READ ================= */

  getFeed: () => {
    return apiFetch<PostResponseType[]>("/api/posts/feed");
  },

  getReels: () => {
    return apiFetch<PostResponseType[]>("/api/posts/reels");
  },

  getStories: () => {
    return apiFetch<PostResponseType[]>("/api/posts/stories");
  },

  getPostByUser: (userId: number) => {
    return apiFetch<PostResponseType[]>(`/api/posts/user/${userId}`);
  },

  getPostById: (postId: number) => {
    return apiFetch<PostResponseType>(`/api/posts/${postId}`);
  },

  /* ================= LIKE / UNLIKE ================= */

  likePost: (postId: number) => {
    return apiFetch<PostResponseType>(`/api/posts/${postId}/like`, {
      method: "POST",
    });
  },

  unlikePost: (postId: number) => {
    return apiFetch<PostResponseType>(`/api/posts/${postId}/like`, {
      method: "DELETE",
    });
  },

  /* ================= VIEWS ================= */

  incrementViews: (postId: number) => {
    return apiFetch<PostResponseType>(`/api/posts/${postId}/view`, {
      method: "PUT",
    });
  },

  /* ================= DELETE ================= */

  deletePost: (postId: number) => {
    return apiFetch<void>(`/api/posts/${postId}`, {
      method: "DELETE",
    });
  },
};
