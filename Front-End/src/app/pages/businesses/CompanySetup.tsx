import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import { BusinessesApi } from "@/shared/lib/services/businesses";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";

function num(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function CompanySetup() {
  const navigate = useNavigate();
  const { businesses, refreshBusinesses, currentBusinessId, setCurrentBusinessId } =
    useBusinessContext();

  const businessId = useMemo(() => {
    const stored = localStorage.getItem("current_business_id");
    return stored || currentBusinessId;
  }, [currentBusinessId]);

  const currentBusiness = useMemo(() => {
    if (!businessId) return null;
    return businesses.find((b: any) => String(b.id) === String(businessId)) || null;
  }, [businesses, businessId]);

  const [loading, setLoading] = useState(false);

  // ✅ FULL form (matches BusinessEntity)
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
    taxRate: "19",
    logoUrl: "",
  });

  // Prefill from current business
  useEffect(() => {
    const b: any = currentBusiness;
    if (!b) return;

    setForm({
      name: b.name || "",
      type: b.type || "SARL",
      address: b.address || "",
      city: b.city || "",
      country: b.country || "Tunisia",
      taxId: b.taxId || "",
      phone: b.phone || "",
      email: b.email || "",
      website: b.website || "",
      currency: b.currency || "TND",
      fiscalYearStart: b.fiscalYearStart || "2024-01-01",
      industry: b.industry || "",
      taxRate: String(b.taxRate ?? 19),
      logoUrl: b.logoUrl || "",
    });
  }, [currentBusiness]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessId) {
      toast.error("No business found for setup.");
      return;
    }

    // minimal required (based on your entity: most are NOT nullable)
    if (!form.name.trim()) return toast.error("Company name is required.");
    if (!form.type.trim()) return toast.error("Type is required.");
    if (!form.address.trim()) return toast.error("Address is required.");
    if (!form.city.trim()) return toast.error("City is required.");
    if (!form.country.trim()) return toast.error("Country is required.");
    if (!form.taxId.trim()) return toast.error("Tax ID is required.");
    if (!form.phone.trim()) return toast.error("Phone is required.");
    if (!form.email.trim()) return toast.error("Email is required.");
    if (!form.currency.trim()) return toast.error("Currency is required.");
    if (!form.fiscalYearStart.trim()) return toast.error("Fiscal year start is required.");
    if (!form.industry.trim()) return toast.error("Industry is required.");

    const taxRate = num(form.taxRate, NaN);
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return toast.error("Tax rate must be between 0 and 100.");
    }

    try {
      setLoading(true);

      // ✅ PATCH profile with ALL fields
      await BusinessesApi.completeProfile(String(businessId), {
        name: form.name.trim(),
        type: form.type.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        taxId: form.taxId.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        website: form.website.trim() || undefined,
        currency: form.currency.trim(),
        fiscalYearStart: form.fiscalYearStart,
        industry: form.industry.trim(),
        taxRate,
        logoUrl: form.logoUrl.trim() || undefined,
      } as any);

      // ✅ Update local storage + context
      localStorage.setItem("current_business_id", String(businessId));
      setCurrentBusinessId(String(businessId));

      // ✅ Refresh to get updated values
      await refreshBusinesses();
      window.dispatchEvent(new Event("business-changed"));

      toast.success("Company profile saved!");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error("Failed", { description: err?.message || "Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Company Profile</CardTitle>
        <CardDescription>
          Fill all company details. These fields will be stored in the database.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4" noValidate>
          <div className="space-y-2 md:col-span-2">
            <Label>Company Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Industry *</Label>
            <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Address *</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>City *</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Country *</Label>
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Tax ID *</Label>
            <Input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Tax Rate (%) *</Label>
            <Input
              type="number"
              step="0.01"
              value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Currency *</Label>
            <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Fiscal Year Start *</Label>
            <Input
              type="date"
              value={form.fiscalYearStart}
              onChange={(e) => setForm({ ...form, fiscalYearStart: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Website</Label>
            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          </div>

          <div className="md:col-span-2 pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}