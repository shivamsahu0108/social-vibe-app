import { authService } from "@/api/auth.service";
import { useAuthStore } from "@/store";
import { useMutation } from "@tanstack/react-query";

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
    },
  });
}
