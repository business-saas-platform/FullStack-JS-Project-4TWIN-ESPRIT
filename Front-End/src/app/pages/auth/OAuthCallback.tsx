import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      toast.error("OAuth failed", { description: "Missing token" });
      navigate("/auth/login", { replace: true });
      return;
    }

    localStorage.setItem("access_token", token);

    toast.success("Signed in successfully");
    navigate("/dashboard", { replace: true });
  }, [navigate, params]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  );
}
