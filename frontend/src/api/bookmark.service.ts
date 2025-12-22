import { apiFetch } from "./client";
import type { BookmarkResponse } from "@/types/BookmarkResponse";

export const bookmarkService = {
  addBookmark: (postId: number) => {
    return apiFetch<BookmarkResponse>(`/api/bookmarks/${postId}`, {
      method: "POST",
    });
  },

  removeBookmark: (postId: number) => {
    return apiFetch<void>(`/api/bookmarks/${postId}`, {
      method: "DELETE",
    });
  },

  isBookmarked: (postId: number) => {
    return apiFetch<boolean>(`/api/bookmarks/${postId}/check`);
  },

  getMyBookmarks: () => {
    return apiFetch<BookmarkResponse[]>(`/api/bookmarks`);
  },
};
