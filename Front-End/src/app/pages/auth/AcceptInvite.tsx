import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { api } from "@/shared/lib/apiClient";

export default function AcceptInvite() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!token) {
      toast.error("Lien invalide", {
        description: "Le lien d'invitation ne contient pas de token (?token=...)",
      });
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Mot de passe invalide", { description: "Minimum 6 caractères" });
      return;
    }

    try {
      setLoading(true);
      const res = await api<{ access_token: string; user: any }>(`/auth/accept-invite`, {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      // ✅ save token + user
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));

      toast.success("Compte créé ✅");
      nav("/dashboard");
    } catch (e: any) {
      toast.error("Erreur", { description: e?.message || "Impossible d'accepter l'invitation" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          {!token && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Token manquant dans l'URL. Utilise un lien مثل:
              <br />
              <span className="break-all">
                /auth/accept-invite?token=XXXX
              </span>
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>

          <Button className="w-full" onClick={submit} disabled={loading || !token}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
