import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiFetch } from "@/api/client";
import { useAuthStore } from "@/store";

export default function Register() {
  const navigate = useNavigate();
  const { setAccessToken } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!otpSent) {
        // Step 1: Register (Send OTP)
        if (!username || !email || !password) {
          throw new Error("All fields are required");
        }
        await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        });
        setOtpSent(true);
      } else {
        // Step 2: Verify OTP
        if (!otp) {
          throw new Error("Please enter OTP");
        }
        const data = await apiFetch<any>("/api/auth/verify-account", {
          method: "POST",
          body: JSON.stringify({ email, otp }),
        });

        setAccessToken(data.accessToken);
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-linear-to-bl from-pink-500/10 via-background to-orange-500/10" />
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-500/20 rounded-full blur-[100px]" />

      <Link
        to="/landing"
        className="absolute top-8 left-8 flex items-center text-muted-foreground hover:text-foreground transition-colors z-20"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Link>

      <Card className="w-full max-w-sm relative z-10 border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-linear-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription>Join the community today</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            {!otpSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="cool_vibe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="hello@vibeshare.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-center text-muted-foreground mb-2">
                  Enter the OTP sent to{" "}
                  <span className="font-semibold text-foreground">{email}</span>
                </div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="Check your email"
                  className="text-center tracking-widest text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  maxLength={6}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-linear-to-r from-pink-500 to-orange-500 hover:opacity-90 transition-all font-semibold shadow-lg shadow-pink-500/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {otpSent ? "Verifying..." : "Sending OTP..."}
                </>
              ) : otpSent ? (
                "Verify & Create Account"
              ) : (
                "Sign Up"
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground w-full">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-semibold"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
