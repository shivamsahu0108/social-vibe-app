import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";
import {
  ArrowLeft,
  Moon,
  Sun,
  User,
  Bell,
  Lock,
  Eye,
  Shield,
  HelpCircle,
  LogOut,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/useLogout";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 pb-4 border-b border-border">
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </div>

        {/* Appearance */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Sun className="h-5 w-5 text-pink-500" />
              </div>
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize how VibeShare looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Theme</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center space-y-3 hover:bg-accent transition-all",
                    theme === "light"
                      ? "border-pink-500 bg-pink-500/5 shadow-lg shadow-pink-500/10"
                      : "border-border"
                  )}
                  onClick={() => setTheme("light")}
                >
                  <div
                    className={cn(
                      "p-3 rounded-full",
                      theme === "light" ? "bg-pink-500" : "bg-muted"
                    )}
                  >
                    <Sun
                      className={cn(
                        "h-6 w-6",
                        theme === "light"
                          ? "text-white"
                          : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Light</p>
                    <p className="text-xs text-muted-foreground">
                      Bright and clean
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center space-y-3 hover:bg-accent transition-all",
                    theme === "dark"
                      ? "border-pink-500 bg-pink-500/5 shadow-lg shadow-pink-500/10"
                      : "border-border"
                  )}
                  onClick={() => setTheme("dark")}
                >
                  <div
                    className={cn(
                      "p-3 rounded-full",
                      theme === "dark" ? "bg-pink-500" : "bg-muted"
                    )}
                  >
                    <Moon
                      className={cn(
                        "h-6 w-6",
                        theme === "dark"
                          ? "text-white"
                          : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Dark</p>
                    <p className="text-xs text-muted-foreground">
                      Easy on the eyes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <span>Account</span>
            </CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 rounded-xl hover:bg-accent"
              onClick={() => navigate("/profile/edit")}
            >
              <User className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>Edit Profile</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 rounded-xl hover:bg-accent"
              onClick={() => navigate("/forgot-password")}
            >
              <Lock className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>Change Password</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 rounded-xl hover:bg-accent"
            >
              <Eye className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>Privacy Settings</span>
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Bell className="h-5 w-5 text-purple-500" />
              </div>
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 rounded-xl hover:bg-accent"
            >
              <Bell className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>Push Notifications</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 rounded-xl hover:bg-accent"
            >
              <Shield className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>Email Notifications</span>
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <HelpCircle className="h-5 w-5 text-green-500" />
              </div>
              <span>Support</span>
            </CardTitle>
            <CardDescription>Get help and support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 rounded-xl hover:bg-accent"
            >
              <HelpCircle className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>Help Center</span>
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-12 px-4 rounded-xl text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20 border-orange-200 dark:border-orange-900"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Log Out</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 px-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900"
            >
              <Trash2 className="h-5 w-5 mr-3" />
              <span>Delete Account</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
