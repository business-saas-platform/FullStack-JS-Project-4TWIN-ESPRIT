import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

import { BusinessesApi } from "@/shared/lib/services/businesses";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";

export default function CreateBusiness() {
  const navigate = useNavigate();
  const { refreshBusinesses } = useBusinessContext();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "SARL",
    address: "",
    city: "",
    country: "Tunisia",
    taxId: "",
    phone: "",
    email: "",
    website: "",
    currency: "TND",
    fiscalYearStart: "2024-01-01",
    industry: "",
    taxRate: 19,
  });

  const onChange = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // ✅ 1) create and capture created business
      const created: any = await BusinessesApi.create({
        ...form,
        taxRate: Number(form.taxRate),
        website: form.website || undefined,
      } as any);

      // ✅ 2) set as current business immediately
      if (created?.id) {
        localStorage.setItem("current_business_id", String(created.id));
        window.dispatchEvent(new Event("business-changed"));
      }

      toast.success("Entreprise créée ✅");

      // ✅ 3) refresh list
      await refreshBusinesses();

      // ✅ 4) redirect: if incomplete -> setup page
      if (created?.isProfileComplete === false) {
        navigate("/dashboard/company/setup", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error("Erreur", {
        description: err?.message || "Création impossible",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Créer une entreprise</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Annuler
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'entreprise</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Nom *</Label>
              <Input
                placeholder="Ex: BizManager SARL"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <Input value={form.type} onChange={(e) => onChange("type", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Industry *</Label>
              <Input
                placeholder="Ex: IT Services"
                value={form.industry}
                onChange={(e) => onChange("industry", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Adresse *</Label>
              <Input
                placeholder="Ex: Rue Habib Bourguiba"
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Ville *</Label>
              <Input value={form.city} onChange={(e) => onChange("city", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Pays *</Label>
              <Input value={form.country} onChange={(e) => onChange("country", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Tax ID *</Label>
              <Input value={form.taxId} onChange={(e) => onChange("taxId", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="https://..."
                value={form.website}
                onChange={(e) => onChange("website", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Currency *</Label>
              <Input value={form.currency} onChange={(e) => onChange("currency", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Fiscal year start *</Label>
              <Input
                type="date"
                value={form.fiscalYearStart}
                onChange={(e) => onChange("fiscalYearStart", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tax rate (%) *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.taxRate}
                onChange={(e) => onChange("taxRate", e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création..." : "Créer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}