import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-500/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/30 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
        <div className="inline-flex items-center rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-sm font-medium text-pink-500 backdrop-blur-md">
          <Sparkles className="mr-2 h-4 w-4" />
          <span>The next gen social vibe</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
          Share Your <br />
          <span className="bg-linear-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-gradient-x">
            True Vibe
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Connect, share, and inspire in a space designed for aesthetics and
          community. Join the creative revolution today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-full bg-linear-to-r from-pink-500 to-orange-500 hover:opacity-90 shadow-lg shadow-pink-500/25 transition-all hover:scale-105"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg rounded-full border-2 hover:bg-accent/50 backdrop-blur-sm transition-all hover:scale-105"
            >
              Log In
            </Button>
          </Link>
        </div>
      </div>

      {/* Abstract Shapes/Mockup Placeholder */}
      <div className="mt-16 relative w-full max-w-5xl mx-auto perspective-1000 hidden md:block">
        <div className="grid grid-cols-3 gap-8 opacity-50 rotate-x-12 scale-90">
          <div className="h-64 rounded-2xl bg-muted animate-pulse delay-100"></div>
          <div className="h-64 rounded-2xl bg-muted animate-pulse delay-200 translate-y-8"></div>
          <div className="h-64 rounded-2xl bg-muted animate-pulse delay-300"></div>
        </div>
      </div>
    </div>
  );
}
