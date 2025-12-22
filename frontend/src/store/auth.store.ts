import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserResponseType } from "@/types/UserResponseType";

type AuthState = {
  user: UserResponseType | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  authChecked: boolean;

  setAuth: (access: string, refresh: string) => void;
  setAccessToken: (access: string) => void;

  setUser: (user: UserResponseType | null) => void;
  clearUser: () => void;

  logout: () => void;
  setAuthChecked: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      authChecked: false,

      setAuth: (access, refresh) =>
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        }),

      setAccessToken: (access) =>
        set({
          accessToken: access,
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          authChecked: true,
        }),

      setAuthChecked: () =>
        set({
          authChecked: true,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          authChecked: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          authChecked: false,
        }),
    }),
    { name: "auth-storage" }
  )
);
