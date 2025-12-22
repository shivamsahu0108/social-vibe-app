import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/api/client";
import { useAuthStore } from "@/store";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken } = useAuthStore();

  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<any>("/api/auth/verify-account", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      setAccessToken(data.accessToken);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-linear-to-tr from-pink-500/10 via-background to-orange-500/10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-pink-500/20 rounded-full blur-[100px]" />
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-orange-500/20 rounded-full blur-[100px]" />

      <Link
        to="/login"
        className="absolute top-8 left-8 flex items-center text-muted-foreground hover:text-foreground transition-colors z-20"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
      </Link>

      <Card className="w-full max-w-sm relative z-10 border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Verify Your Account
          </CardTitle>
          <CardDescription>
            Enter the OTP sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!emailParam || loading}
                className={emailParam ? "bg-muted text-muted-foreground" : ""}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="6-digit code"
                className="text-center tracking-widest text-lg"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-linear-to-r from-pink-500 to-orange-500"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
