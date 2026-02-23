import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, Download, Send, Printer } from "lucide-react";
import { toast } from "sonner";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";
import { InvoicesApi, type Invoice } from "@/shared/lib/services/invoices";
import { ClientsApi } from "@/shared/lib/services/clients"; // إذا عندك clients api
// إذا ما عندكش ClientsApi، نعمل fallback ب clientName فقط.

type ClientLite = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
};

export function ViewInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBusiness } = useBusinessContext();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<ClientLite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    InvoicesApi.get(id)
      .then(async (inv) => {
        setInvoice(inv);

        // حاول نجيب client details إذا API موجودة
        try {
          if (inv.clientId && currentBusiness?.id) {
            const c = await ClientsApi.get(inv.clientId); // لازم يكون موجود في مشروعك
            setClient(c);
          } else {
            setClient(null);
          }
        } catch {
          setClient(null);
        }
      })
      .catch((e: any) => {
        toast.error(e?.message ?? "Failed to load invoice");
        setInvoice(null);
      })
      .finally(() => setLoading(false));
  }, [id, currentBusiness?.id]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      sent: "bg-blue-100 text-blue-800",
      overdue: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      cancelled: "bg-yellow-100 text-yellow-800",
    };
    return variants[status] || variants.draft;
  };

  const totals = useMemo(() => {
    if (!invoice) return { subtotal: 0, tax: 0, total: 0, paid: 0 };

    return {
      subtotal: Number(invoice.subtotal ?? 0),
      tax: Number(invoice.taxAmount ?? 0),
      total: Number(invoice.totalAmount ?? 0),
      paid: Number(invoice.paidAmount ?? 0),
    };
  }, [invoice]);

  const handleDownload = () => {
    toast.info("PDF generation not implemented yet");
  };

  const handleSend = async () => {
    if (!invoice) return;
    try {
      await InvoicesApi.markSent(invoice.id);
      toast.success("Invoice marked as sent");
      setInvoice({ ...invoice, status: "sent" });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send invoice");
    }
  };

  const handlePrint = () => window.print();

  // ✅ Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-gray-500">Loading invoice...</CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Not found
  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
        <Button className="mt-4" onClick={() => navigate("/dashboard/invoices")}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  // ✅ Business fallback
  const bizName = currentBusiness?.name ?? "Business";
  const bizAddress = currentBusiness?.address ?? "";
  const bizPhone = currentBusiness?.phone ?? "";
  const bizEmail = currentBusiness?.email ?? "";
  const bizTaxId = currentBusiness?.taxId ?? "";
  const bizTaxRate = Number(currentBusiness?.taxRate ?? invoice.taxAmount ? (invoice.taxAmount / (invoice.subtotal || 1)) * 100 : 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <Badge className={`mt-2 ${getStatusBadge(invoice.status)}`}>{invoice.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {invoice.status === "draft" && (
            <Button size="sm" onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
        </div>
      </div>

      {/* Invoice preview */}
      <Card className="print:shadow-none">
        <CardContent className="p-8 md:p-12">
          {/* Business & Client Info */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">From</h2>
              <p className="font-semibold text-gray-900">{bizName}</p>
              {bizAddress && <p className="text-sm text-gray-600 mt-1">{bizAddress}</p>}
              {bizPhone && <p className="text-sm text-gray-600">{bizPhone}</p>}
              {bizEmail && <p className="text-sm text-gray-600">{bizEmail}</p>}
              {bizTaxId && <p className="text-sm text-gray-600">Tax ID: {bizTaxId}</p>}
            </div>

            <div className="text-right">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Bill To</h2>
              <p className="font-semibold text-gray-900">{invoice.clientName}</p>

              {/* client details optional */}
              {client?.address && <p className="text-sm text-gray-600 mt-1">{client.address}</p>}
              {client?.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
              {client?.email && <p className="text-sm text-gray-600">{client.email}</p>}
              {client?.taxId && <p className="text-sm text-gray-600">Tax ID: {client.taxId}</p>}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b">
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-semibold mt-1">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-semibold mt-1">{new Date(invoice.issueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-semibold mt-1">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Unit Price</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-4 text-gray-900">{item.description}</td>
                    <td className="text-right py-4 text-gray-600">{item.quantity}</td>
                    <td className="text-right py-4 text-gray-600">
                      {Number(item.unitPrice ?? 0).toFixed(2)} {invoice.currency ?? "TND"}
                    </td>
                    <td className="text-right py-4 font-medium text-gray-900">
                      {Number(item.amount ?? 0).toFixed(2)} {invoice.currency ?? "TND"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{totals.subtotal.toFixed(2)} {invoice.currency ?? "TND"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({Number(bizTaxRate ?? 0).toFixed(2)}%)</span>
                <span className="font-medium">{totals.tax.toFixed(2)} {invoice.currency ?? "TND"}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {totals.total.toFixed(2)} {invoice.currency ?? "TND"}
                  </span>
                </div>
              </div>

              {totals.paid > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid</span>
                    <span className="font-medium text-green-600">-{totals.paid.toFixed(2)} {invoice.currency ?? "TND"}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-bold text-gray-900">Balance Due</span>
                    <span className="text-xl font-bold text-gray-900">
                      {(totals.total - totals.paid).toFixed(2)} {invoice.currency ?? "TND"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
