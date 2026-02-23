import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Plus, Trash2, ArrowLeft, Save, Send } from "lucide-react";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";
import { toast } from "sonner";

import type { Client } from "@/shared/lib/mockData"; // أو type Client من عندك
import { ClientsApi } from "@/shared/lib/services/clients";
import { InvoicesApi } from "@/shared/lib/services/invoices";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // ✅ NEW
}

const clampNumber = (v: any, fallback = 0) => {
  const x = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(x) ? x : fallback;
};

export function CreateInvoice() {
  const navigate = useNavigate();
  const { currentBusiness } = useBusinessContext();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(() => `INV-${Date.now()}`);
  const [submitting, setSubmitting] = useState(false);

  const defaultTaxRate = clampNumber(currentBusiness?.taxRate ?? 0);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, taxRate: defaultTaxRate },
  ]);

  // Sync default tax rate when business changes (only for empty items / first load)
  useEffect(() => {
    setLineItems((prev) =>
      prev.map((it, idx) =>
        idx === 0 && it.description.trim() === "" && it.unitPrice === 0
          ? { ...it, taxRate: defaultTaxRate }
          : it
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBusiness?.id]);

  // Load clients for current business
  useEffect(() => {
    const bid = currentBusiness?.id;
    if (!bid) {
      setClients([]);
      return;
    }

    setClientsLoading(true);
    ClientsApi.list(bid)
      .then((list) => setClients(list ?? []))
      .catch(() => {
        setClients([]);
        toast.error("Erreur", { description: "Impossible de charger les clients" });
      })
      .finally(() => setClientsLoading(false));
  }, [currentBusiness?.id]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId),
    [clients, clientId]
  );

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: defaultTaxRate, // ✅ NEW line gets business tax rate by default
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  };

  const updateLineItem = (
    id: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "description"
                  ? String(value)
                  : clampNumber(value, field === "quantity" ? 1 : 0),
            }
          : item
      )
    );
  };

  // ✅ subtotal per items
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, it) => {
      const qty = clampNumber(it.quantity, 1);
      const price = clampNumber(it.unitPrice, 0);
      return sum + qty * price;
    }, 0);
  }, [lineItems]);

  // ✅ taxAmount per items (each item has its own taxRate)
  const taxAmount = useMemo(() => {
    return lineItems.reduce((sum, it) => {
      const qty = clampNumber(it.quantity, 1);
      const price = clampNumber(it.unitPrice, 0);
      const rate = clampNumber(it.taxRate, 0);
      return sum + qty * price * (rate / 100);
    }, 0);
  }, [lineItems]);

  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const currency = currentBusiness?.currency ?? "TND";

  const validate = (needDueDate: boolean) => {
    if (!currentBusiness?.id) {
      toast.error("Aucune entreprise sélectionnée");
      return false;
    }
    if (!clientId) {
      toast.error("Veuillez sélectionner un client");
      return false;
    }
    if (needDueDate && !dueDate) {
      toast.error("Veuillez définir une date d'échéance");
      return false;
    }

    const validItems = lineItems.filter((i) => {
      const hasDesc = i.description.trim().length > 0;
      const qty = clampNumber(i.quantity, 0);
      const price = clampNumber(i.unitPrice, 0);
      return hasDesc && qty > 0 && price >= 0;
    });

    if (validItems.length === 0) {
      toast.error("Ajoutez au moins un line item valide (description + quantité)");
      return false;
    }

    return true;
  };

  const saveToDb = async (status: "draft" | "sent") => {
    if (!validate(status === "sent")) return;

    const bid = currentBusiness!.id;

    const payload = {
      businessId: bid,
      clientId,
      clientName: selectedClient?.name ?? "",
      invoiceNumber,
      issueDate,
      dueDate: dueDate || issueDate, // draft ممكن ما عندوش dueDate
      currency,
      // ⚠️ نخلي taxRate على مستوى invoice اختياري (إذا backend يحتاجو)
      taxRate: defaultTaxRate,
      paidAmount: 0,
      notes,
      status,
      items: lineItems
        .filter((i) => i.description.trim())
        .map((i) => ({
          description: i.description.trim(),
          quantity: clampNumber(i.quantity, 1),
          unitPrice: clampNumber(i.unitPrice, 0),
          taxRate: clampNumber(i.taxRate, 0), // ✅ IMPORTANT (fix NOT NULL taxRate)
        })),
    };

    try {
      setSubmitting(true);
      await InvoicesApi.create(payload as any);
      toast.success(status === "draft" ? "Facture enregistrée (draft)" : "Facture envoyée (sent)");
      navigate("/dashboard/invoices");
    } catch (e: any) {
      toast.error("Erreur", {
        description: e?.message || "Impossible de créer la facture",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Créer une facture</h1>
            <p className="mt-1 text-sm text-gray-500">
              Créez une nouvelle facture pour{" "}
              <span className="font-medium text-indigo-600">{currentBusiness?.name ?? "..."}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Invoice form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger id="client">
                      <SelectValue placeholder={clientsLoading ? "Loading..." : "Select a client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">Aucun client pour cette entreprise</div>
                      ) : (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {clients.length === 0 && !clientsLoading && (
                    <p className="text-xs text-gray-500">
                      Veuillez d'abord ajouter des clients pour {currentBusiness?.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-12 sm:col-span-4">
                      <Label htmlFor={`desc-${item.id}`}>Description</Label>
                      <Input
                        id={`desc-${item.id}`}
                        placeholder="Service or product description"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <Label htmlFor={`qty-${item.id}`}>Qty</Label>
                      <Input
                        id={`qty-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)
                        }
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-3">
                      <Label htmlFor={`price-${item.id}`}>Unit Price</Label>
                      <Input
                        id={`price-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    {/* ✅ NEW TAX COLUMN */}
                    <div className="col-span-4 sm:col-span-2">
                      <Label htmlFor={`tax-${item.id}`}>Tax %</Label>
                      <Input
                        id={`tax-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(e) =>
                          updateLineItem(item.id, "taxRate", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="col-span-12 sm:col-span-1 flex items-end justify-end">
                      {lineItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(item.id)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    {/* Amount row (optional) */}
                    <div className="col-span-12">
                      <div className="text-right text-sm text-gray-600">
                        Amount:{" "}
                        <span className="font-medium text-gray-900">
                          {(clampNumber(item.quantity, 1) * clampNumber(item.unitPrice, 0)).toFixed(2)} {currency}
                        </span>{" "}
                        | Tax:{" "}
                        <span className="font-medium text-gray-900">
                          {(
                            clampNumber(item.quantity, 1) *
                            clampNumber(item.unitPrice, 0) *
                            (clampNumber(item.taxRate, 0) / 100)
                          ).toFixed(2)}{" "}
                          {currency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any additional notes or payment terms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {subtotal.toFixed(2)} {currency}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  {taxAmount.toFixed(2)} {currency}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {total.toFixed(2)} {currency}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Button className="w-full" disabled={submitting} onClick={() => saveToDb("sent")}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invoice
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  disabled={submitting}
                  onClick={() => saveToDb("draft")}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>

                <Button variant="ghost" className="w-full" onClick={() => navigate("/dashboard/invoices")}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
