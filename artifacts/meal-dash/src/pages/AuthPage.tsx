// artifacts/meal-dash/src/pages/AuthPage.tsx
import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { UtensilsCrossed, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const searchStr = useSearch();

  // Where to go after login — defaults to home, never auto-admin
  const params = new URLSearchParams(searchStr);
  const rawFrom = params.get("from") || "/";
  // Strip /admin from redirect — admin must navigate there manually
  const redirectTo = rawFrom === "/admin" ? "/" : (rawFrom.startsWith("/") ? rawFrom : "/");

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", address: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      const res = login(form.email, form.password);
      if (!res.ok) {
        toast({ title: "Login failed", description: res.error, variant: "destructive" });
      } else {
        toast({ title: "Welcome back! 👋" });
        // Always go to home after login — admin navigates to /admin from navbar
        setLocation(redirectTo);
      }
    } else {
      if (!form.name || !form.email || !form.password || !form.phone) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const res = signup(form);
      if (!res.ok) {
        toast({ title: "Sign up failed", description: res.error, variant: "destructive" });
      } else {
        toast({ title: "Welcome to MealDash! 🎉", description: "Your account has been created" });
        setLocation(redirectTo);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
            <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Meal<span className="text-primary">Dash</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-muted p-1 mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-2xl p-6 shadow-sm">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={set("name")}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={set("email")}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+234 801 234 5678"
                  value={form.phone}
                  onChange={set("phone")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">
                  Default Delivery Address{" "}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="address"
                  placeholder="e.g. 12 Ring Road, Ibadan"
                  value={form.address}
                  onChange={set("address")}
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full gap-2 mt-2" size="lg" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-primary font-medium hover:underline"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}