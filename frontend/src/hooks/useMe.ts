import { useEffect } from "react";
import { authService } from "@/api/auth.service";
import { useAuthStore } from "@/store";
export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  const setAuthChecked = useAuthStore((s) => s.setAuthChecked);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    authService
      .me()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        // user not logged in
        clearUser();
      })
      .finally(() => {
        setAuthChecked();
      });
  }, [setUser, setAuthChecked, clearUser]);
}
