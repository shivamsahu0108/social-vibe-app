import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "@/types/AuthResponseType";
import { apiFetch } from "./client";
import type { UserResponseType } from "@/types/UserResponseType";

const BASE_URL = import.meta.env.VITE_BASE_URL;
export const authService = {
  login: (data: LoginPayload): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  register: (data: RegisterPayload): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  refreshToken: async (token: string): Promise<{ accessToken: string }> => {
    // Backend expects raw string body and returns raw string or JSON
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: token,
    });

    if (!res.ok) {
      throw new Error("Refresh token expired");
    }

    const text = await res.text();
    // Try parsing as JSON in case backend changes, otherwise treat as raw string
    try {
      const data = JSON.parse(text);
      return { accessToken: data.accessToken || data.token || text };
    } catch {
      return { accessToken: text };
    }
  },
  me: (): Promise<UserResponseType> => apiFetch("/api/auth/me"),
  logout: (): Promise<void> => {
    // Optional: Call backend to invalidate token if your API supports it.
    // For now we just resolve, as client side clears the store.
    return Promise.resolve();
  },
};
