import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { ArrowLeft, Mail, Phone, MapPin, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";

import { useBusinessContext } from "@/shared/contexts/BusinessContext";
import { api } from "@/shared/lib/apiClient"; // ✅ نفس api function اللي عندك

type Client = {
  id: string;
  businessId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdAt?: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number | null;
  totalAmount: number | null;
  paidAmount: number;
  currency?: string;
  createdAt?: string;
};

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBusiness } = useBusinessContext();

  const businessId = currentBusiness?.id;
  const currency = currentBusiness?.currency ?? "TND";

  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = id;
    if (!clientId) return;

    (async () => {
      try {
        setLoading(true);

        // ✅ 1) Try GET /clients/:id
        let c: Client | null = null;
        try {
          c = await api<Client>(`/clients/${clientId}`);
        } catch {
          c = null;
        }

        // ✅ 2) If not found, fallback: GET /clients?businessId=...
        if (!c) {
          if (!businessId) {
            setClient(null);
            setInvoices([]);
            return;
          }
          const list = await api<Client[]>(`/clients?businessId=${businessId}`);
          c = (list ?? []).find((x) => x.id === clientId) ?? null;
        }

        setClient(c);

        // ✅ invoices
        if (businessId) {
          const allInvoices = await api<Invoice[]>(`/invoices?businessId=${businessId}`);
          const invs = (allInvoices ?? []).filter((inv) => inv.clientId === clientId);
          setInvoices(invs);
        } else {
          setInvoices([]);
        }
      } catch (e: any) {
        toast.error("Erreur", { description: e?.message || "Impossible de charger les données" });
        setClient(null);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, businessId]);

  const totals = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, inv) => {
      const subtotal = n(inv.subtotal);
      const tax = n(inv.taxAmount);
      const total = n(inv.totalAmount) || subtotal + tax;
      return sum + total;
    }, 0);

    const totalPaid = invoices.reduce((sum, inv) => sum + n(inv.paidAmount), 0);
    const outstanding = Math.max(0, totalInvoiced - totalPaid);

    return { totalInvoiced, totalPaid, outstanding };
  }, [invoices]);

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

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/clients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Loading...</h1>
            <p className="mt-1 text-sm text-gray-500">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
        <Button className="mt-4" onClick={() => navigate("/dashboard/clients")}>
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Client details and transaction history</p>
        </div>
        <Button onClick={() => navigate(`/dashboard/invoices/create?clientId=${client.id}`)}>
          <FileText className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{client.email || "-"}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{client.phone || "-"}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div><p className="text-sm text-gray-500">Address</p><p className="font-medium">{client.address || "-"}</p></div>
            </div>
            {client.taxId && (
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                <div><p className="text-sm text-gray-500">Tax ID</p><p className="font-medium">{client.taxId}</p></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Financial Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Invoiced</p>
              <p className="text-2xl font-bold mt-1">{totals.totalInvoiced.toFixed(2)} {currency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totals.totalPaid.toFixed(2)} {currency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Outstanding Balance</p>
              <p className={`text-2xl font-bold mt-1 ${totals.outstanding > 0 ? "text-orange-600" : "text-green-600"}`}>
                {totals.outstanding.toFixed(2)} {currency}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold mt-1">{invoices.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Client Since</p>
              <p className="text-lg font-medium mt-1">
                {client.createdAt ? new Date(client.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <Badge className={`mt-1 ${totals.outstanding === 0 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                {totals.outstanding === 0 ? "All Paid" : "Has Outstanding"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Invoice History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No invoices yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => {
                      const amount = n(inv.totalAmount) || n(inv.subtotal) + n(inv.taxAmount);
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                          <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{amount.toFixed(2)} {currency}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(inv.status)}>{inv.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/invoices/${inv.id}`)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.slice(0, 5).map((inv) => {
                  const amount = n(inv.totalAmount) || n(inv.subtotal) + n(inv.taxAmount);
                  return (
                    <div key={inv.id} className="flex items-center gap-4 border-b pb-3 last:border-0">
                      <div className="p-2 bg-indigo-50 rounded">
                        <DollarSign className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{inv.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">
                          {(inv.createdAt ? new Date(inv.createdAt) : new Date(inv.issueDate)).toLocaleDateString()} - {inv.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{amount.toFixed(2)} {currency}</p>
                      </div>
                    </div>
                  );
                })}
                {invoices.length === 0 && <p className="text-center py-8 text-gray-500">No activity yet</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
