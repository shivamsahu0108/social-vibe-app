import { useMutation } from "@tanstack/react-query";
import { authService } from "@/api/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function useLogin() {
  const setAccessToken = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAccessToken(data.accessToken, data.refreshToken);
      setUser(data.users);
    },
  });
}
