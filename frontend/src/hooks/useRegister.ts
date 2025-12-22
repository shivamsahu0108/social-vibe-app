import { useMutation } from "@tanstack/react-query";
import { authService } from "@/api/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.accessToken, data.refreshToken);
    },
  });
}
