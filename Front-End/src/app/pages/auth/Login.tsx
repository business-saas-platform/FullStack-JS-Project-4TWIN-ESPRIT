import React, { useMemo, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { toast } from "sonner";
import { Turnstile } from "@marsidev/react-turnstile";
import { Github } from "lucide-react";

import { useAuth } from "@/shared/contexts/AuthContext";

type Role =
  | "platform_admin"
  | "business_owner"
  | "business_admin"
  | "accountant"
  | "team_member"
  | "client"
  | string;

type LocationState = {
  from?: { pathname?: string } | string;
};

function redirectByRole(role?: Role) {
  if (role === "platform_admin") return "/admin";
  return "/dashboard";
}

/* 🔵 GOOGLE ICON */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.74 1.22 9.25 3.6l6.9-6.9C35.64 2.1 30.2 0 24 0 14.62 0 6.51 5.36 2.7 13.22l8.05 6.25C12.74 13.32 17.94 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.64-.15-3.22-.43-4.75H24v9h12.7c-.55 2.95-2.22 5.45-4.74 7.13l7.3 5.67C43.94 37.66 46.5 31.64 46.5 24.5z"
    />
    <path
      fill="#FBBC05"
      d="M10.75 28.47c-1.05-3.13-1.05-6.51 0-9.64L2.7 12.58C.96 15.92 0 19.86 0 24s.96 8.08 2.7 11.42l8.05-6.25z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.2 0 11.64-2.05 15.52-5.6l-7.3-5.67c-2.03 1.36-4.63 2.17-8.22 2.17-6.06 0-11.26-3.82-13.25-9.97l-8.05 6.25C6.51 42.64 14.62 48 24 48z"
    />
  </svg>
);

/**
 * Helper: extracts backend error message (api wrapper)
 */
function getErrorMessage(err: any): string {
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Invalid credentials"
  );
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const siteKey = useMemo(
    () => import.meta.env.VITE_TURNSTILE_SITE_KEY as string,
    []
  );

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

  const startOAuth = (provider: "google" | "github") => {
    window.location.href = `${backendUrl}/auth/${provider}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      toast.error("Please enter your credentials");
      return;
    }

    if (!captchaToken) {
      toast.error("Please verify you are human (CAPTCHA).");
      return;
    }

    try {
      setLoading(true);

      // ✅ AuthContext.login(email,password,captchaToken) returns { user, mustChangePassword }
      const result = await login(cleanEmail, password, captchaToken);

      const user = result.user;
      const mustChangePassword = !!result.mustChangePassword;

      if (!user) {
        toast.error("Login failed", { description: "User not returned" });
        return;
      }

      // ✅ Force password change
      if (mustChangePassword) {
        toast.info("First login: please change your password.");
        navigate("/auth/force-change-password", {
          replace: true,
          state: { from: state?.from || "/dashboard" },
        });
        return;
      }

      toast.success("Login successful!");

      const from = state?.from;
      const fromPath = typeof from === "string" ? from : from?.pathname;

      const target = fromPath || redirectByRole(user.role as Role);
      navigate(target, { replace: true });
    } catch (err: any) {
      const msg = getErrorMessage(err);

      if (String(msg).toLowerCase().includes("locked")) {
        toast.error("Account locked", {
          description:
            "Too many attempts. Your account is locked for 1 hour.",
        });
      } else {
        toast.error("Login failed", {
          description: msg,
        });
      }

      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* OAuth Buttons */}
        <div className="space-y-2 mb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 hover:bg-gray-50"
            onClick={() => startOAuth("google")}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 hover:bg-gray-50"
            onClick={() => startOAuth("github")}
          >
            <Github size={18} />
            Continue with GitHub
          </Button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {/* CAPTCHA */}
          <Turnstile
            siteKey={siteKey}
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => setCaptchaToken(null)}
            onExpire={() => setCaptchaToken(null)}
            options={{ theme: "light" }}
          />

          <div className="flex items-center justify-between">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
