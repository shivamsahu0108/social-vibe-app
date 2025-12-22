import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";

export function AuthDebugPanel() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login("demo@example.com", "password");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-card border-2 border-border rounded-xl shadow-lg z-50 max-w-xs">
      <h3 className="font-bold text-sm mb-2">Auth Debug Panel</h3>
      <div className="space-y-2 text-xs">
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span className={isAuthenticated ? "text-green-500" : "text-red-500"}>
            {isAuthenticated ? "Logged In" : "Logged Out"}
          </span>
        </p>
        {user && (
          <>
            <p>
              <span className="font-semibold">User:</span> {user.username}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
          </>
        )}
        <div className="flex gap-2 pt-2">
          {!isAuthenticated ? (
            <Button size="sm" onClick={handleLogin} className="text-xs h-7">
              Login
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={logout}
              className="text-xs h-7"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
