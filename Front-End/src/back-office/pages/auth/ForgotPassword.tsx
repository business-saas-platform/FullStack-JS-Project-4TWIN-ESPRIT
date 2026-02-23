import { useState } from "react";
import { Link } from "react-router";
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

export function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Email de réinitialisation envoyé!", {
      description: "Vérifiez votre boîte de réception"
    });
  };

  return (
    <div className="space-y-6">
      <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
        <Building2 className="h-8 w-8 text-blue-600" />
        <span className="text-2xl font-bold">BizManager Pro</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email et nous vous enverrons un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@entreprise.tn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Envoyer le lien
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/auth/login" className="text-blue-600 hover:text-blue-700">
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
