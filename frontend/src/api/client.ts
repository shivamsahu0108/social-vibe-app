import { useAuthStore } from "@/store";
import { authService } from "@/api/auth.service";

const BASE_URL = import.meta.env.VITE_API_URL || "";

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const { accessToken, refreshToken, setAccessToken, logout } =
    useAuthStore.getState();
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
    ...options,
  });

  const text = await res.text();

  // ✅ SUCCESS
  if (res.ok) {
    if (!text) return {} as T;
    try {
      return JSON.parse(text);
    } catch {
      return text as unknown as T;
    }
  }

  // 🔁 ACCESS TOKEN EXPIRED
  if (res.status === 401 && retry) {
    if (!isRefreshing) {
      if (!refreshToken) {
        logout();
        throw new Error("No refresh token available");
      }
      isRefreshing = true;
      refreshPromise = authService
        .refreshToken(refreshToken)
        .then((data) => {
          setAccessToken(data.accessToken);
          return data.accessToken;
        })
        .catch(() => {
          logout();
          throw new Error("Session expired");
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    const newToken = await refreshPromise;

    // 🔁 retry original request once
    return apiFetch<T>(
      endpoint,
      {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      },
      false
    );
  }

  // ❌ OTHER ERRORS
  let message = "Request failed";

  try {
    const json = JSON.parse(text);
    message = json.message ?? message;
  } catch {}

  throw new Error(message);
}
