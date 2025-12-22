import { apiFetch } from "@/api/client";
import type { UserResponseType } from "@/types/UserResponseType";

export const userService = {
  getById: (id: number): Promise<UserResponseType> =>
    apiFetch<UserResponseType>(`/api/users/${id}`),

  getFollowers: (id: number): Promise<UserResponseType[]> =>
    apiFetch<UserResponseType[]>(`/api/users/${id}/followers`),

  getFollowings: (id: number): Promise<UserResponseType[]> =>
    apiFetch<UserResponseType[]>(`/api/users/${id}/following`),
  follow: (targetId: number) =>
    apiFetch<void>(`/api/users/follow/${targetId}`, {
      method: "POST",
    }),

  unfollow: (targetId: number) =>
    apiFetch<void>(`/api/users/unfollow/${targetId}`, {
      method: "DELETE",
    }),
  me: () => apiFetch<UserResponseType>("/api/users/me"),

  updateMe: (data: {
    username: string;
    email: string;
    bio: string;
    name: string;
  }) =>
    apiFetch<UserResponseType>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  uploadProfilePic: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiFetch<string>("/api/users/me/upload-profile", {
      method: "POST",
      body: formData,
    });
  },
  setSearch: (query: string) =>
    apiFetch<UserResponseType[]>(
      `/api/users/search?keyword=${encodeURIComponent(query)}`
    ),
};
