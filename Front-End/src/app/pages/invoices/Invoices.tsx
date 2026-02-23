import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { Plus, Search, Eye, Download, Send } from "lucide-react";
import { toast } from "sonner";

import type { Invoice } from "@/shared/lib/mockData";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";
import { InvoicesApi } from "@/shared/lib/services/invoices";

export function Invoices() {
  const navigate = useNavigate();
  const { currentBusiness } = useBusinessContext();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const bid = currentBusiness?.id;
    if (!bid) {
      setInvoices([]);
      return;
    }

    setLoading(true);
    InvoicesApi.list(bid)
      .then((list) => setInvoices(list ?? []))
      .catch(() => {
        setInvoices([]);
        toast.error("Erreur", { description: "Impossible de charger les factures" });
      })
      .finally(() => setLoading(false));
  }, [currentBusiness?.id]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.clientName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      sent: "bg-blue-100 text-blue-800",
      overdue: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      cancelled: "bg-yellow-100 text-yellow-800",
      viewed: "bg-purple-100 text-purple-800",
    };
    return variants[status] || variants.draft;
  };

  const handleDownloadPDF = (invoiceId: string) => {
    // later: GET /api/invoices/:id/pdf
    toast.success(`PDF generated for invoice ${invoiceId}`);
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await InvoicesApi.markSent(invoiceId);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "sent" as any } : inv))
      );
      toast.success("Invoice sent ✅");
    } catch {
      toast.error("Erreur", { description: "Impossible d'envoyer la facture" });
    }
  };

  const totals = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount ?? 0), 0);
    const totalPaid = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + Number(inv.paidAmount ?? 0), 0);
    const pending = invoices
      .filter((inv) => inv.status === "sent" || inv.status === "viewed")
      .reduce((sum, inv) => sum + Number(inv.totalAmount ?? 0), 0);
    const overdue = invoices
      .filter((inv) => inv.status === "overdue")
      .reduce((sum, inv) => sum + Number(inv.totalAmount ?? 0), 0);

    return { totalInvoiced, totalPaid, pending, overdue };
  }, [invoices]);

  const currency = currentBusiness?.currency ?? "TND";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track all your invoices</p>
        </div>
        <Button onClick={() => navigate("/dashboard/invoices/create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by invoice number or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Invoices ({loading ? "..." : filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {Number(invoice.totalAmount ?? 0).toFixed(2)} {currency}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/dashboard/invoices/${invoice.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendInvoice(invoice.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Total Invoiced</div>
            <div className="text-2xl font-bold mt-1">
              {totals.totalInvoiced.toFixed(2)} {currency}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Paid</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {totals.totalPaid.toFixed(2)} {currency}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">
              {totals.pending.toFixed(2)} {currency}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Overdue</div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {totals.overdue.toFixed(2)} {currency}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
