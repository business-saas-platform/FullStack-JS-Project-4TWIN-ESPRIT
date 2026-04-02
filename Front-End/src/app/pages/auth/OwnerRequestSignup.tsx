import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

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

import { RegistrationRequestsApi } from "@/shared/lib/services/registrationRequests";

export default function OwnerRequestSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    ownerName: "",
    ownerEmail: "",
    companyName: "",
    companyCategory: "",
    companyPhone: "",
    companyAddress: "",
    companyTaxId: "",
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ownerEmail = form.ownerEmail.trim().toLowerCase();
    if (!form.ownerName.trim() || !ownerEmail) {
      toast.error("Veuillez remplir vos informations");
      return;
    }
    if (!form.companyName.trim() || !form.companyCategory.trim()) {
      toast.error("Veuillez remplir les informations de l’entreprise");
      return;
    }

    try {
      setLoading(true);

      const res = await RegistrationRequestsApi.create({
        ownerName: form.ownerName.trim(),
        ownerEmail,
        companyName: form.companyName.trim(),
        companyCategory: form.companyCategory.trim(),
        companyPhone: form.companyPhone.trim() || undefined,
        companyAddress: form.companyAddress.trim() || undefined,
        companyTaxId: form.companyTaxId.trim() || undefined,
      });

      toast.success("Demande envoyée ✅", {
        description:
          "L’admin va l’examiner. Vous recevrez un email (accepté/refusé).",
      });

      // Option: redirect back to login
      navigate("/auth/login", { replace: true });
    } catch (err: any) {
      toast.error("Erreur", {
        description: err?.message || "Impossible d’envoyer la demande",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte (Demande)</CardTitle>
        <CardDescription>
          Votre inscription doit être validée par l’admin. Vous recevrez un email
          si elle est acceptée ou refusée.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {/* Owner */}
          <div className="space-y-2">
            <Label htmlFor="ownerName">Nom complet</Label>
            <Input
              id="ownerName"
              value={form.ownerName}
              onChange={(e) => set("ownerName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Email</Label>
            <Input
              id="ownerEmail"
              type="email"
              value={form.ownerEmail}
              onChange={(e) => set("ownerEmail", e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="border-t pt-4" />

          {/* Company basic info */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom entreprise</Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyCategory">Catégorie / Secteur</Label>
            <Input
              id="companyCategory"
              value={form.companyCategory}
              onChange={(e) => set("companyCategory", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyPhone">Téléphone (optionnel)</Label>
            <Input
              id="companyPhone"
              value={form.companyPhone}
              onChange={(e) => set("companyPhone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress">Adresse (optionnel)</Label>
            <Input
              id="companyAddress"
              value={form.companyAddress}
              onChange={(e) => set("companyAddress", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyTaxId">Matricule / Tax ID (optionnel)</Label>
            <Input
              id="companyTaxId"
              value={form.companyTaxId}
              onChange={(e) => set("companyTaxId", e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer la demande"}
          </Button>

          <div className="text-center text-sm">
            Déjà un compte ?{" "}
            <Link
              to="/auth/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Se connecter
            </Link>
          </div>
        </form>

     
        
      </CardContent>
    </Card>
  );
}
