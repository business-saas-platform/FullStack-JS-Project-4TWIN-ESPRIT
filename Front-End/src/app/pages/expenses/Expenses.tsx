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
import { Plus, Search, Check, X } from "lucide-react";
import { toast } from "sonner";

import type { Expense } from "@/shared/lib/mockData";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";
import { ExpensesApi } from "@/shared/lib/services/expenses";

export function Expenses() {
  const navigate = useNavigate();
  const { currentBusiness } = useBusinessContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Load expenses by business
  useEffect(() => {
    const bid = currentBusiness?.id;
    if (!bid) return;

    setIsLoading(true);
    ExpensesApi.list(bid)
      .then((list) => setExpenses(list))
      .catch(() => {
        setExpenses([]);
        toast.error("Impossible de charger les dépenses");
      })
      .finally(() => setIsLoading(false));
  }, [currentBusiness?.id]);

  const categories = useMemo(
    () => Array.from(new Set(expenses.map((e) => e.category))).sort(),
    [expenses]
  );

  const filteredExpenses = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(q) ||
        expense.category.toLowerCase().includes(q) ||
        (expense.vendor ?? "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [expenses, searchTerm, statusFilter, categoryFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return variants[status] || variants.pending;
  };

  const handleApprove = async (expenseId: string) => {
    try {
      const updated = await ExpensesApi.updateStatus(expenseId, "approved");
      setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)));
      toast.success("Expense approved ✅");
    } catch (e: any) {
      toast.error("Erreur", { description: e?.message || "Approve failed" });
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      const updated = await ExpensesApi.updateStatus(expenseId, "rejected");
      setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)));
      toast.success("Expense rejected ✅");
    } catch (e: any) {
      toast.error("Erreur", { description: e?.message || "Reject failed" });
    }
  };

  const summary = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount ?? 0), 0);
    const approved = expenses
      .filter((e) => e.status === "approved")
      .reduce((sum, exp) => sum + Number(exp.amount ?? 0), 0);

    const pending = expenses
      .filter((e) => e.status === "pending")
      .reduce((sum, exp) => sum + Number(exp.amount ?? 0), 0);

    return { total, approved, pending };
  }, [expenses]);

  // ✅ No business selected
  if (!currentBusiness) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <p className="text-sm text-gray-500">
          Aucune entreprise sélectionnée. Créez ou sélectionnez une entreprise.
        </p>
        <Button onClick={() => navigate("/dashboard/businesses/new")}>
          + Créer une entreprise
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage all your business expenses —{" "}
            <span className="font-medium">{currentBusiness.name}</span>
          </p>
        </div>

        <Button onClick={() => navigate("/dashboard/expenses/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Expenses ({filteredExpenses.length}) {isLoading ? "— Loading..." : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {expense.date ? new Date(expense.date).toLocaleDateString() : "-"}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>

                      <TableCell>{expense.description}</TableCell>

                      <TableCell className="font-medium">
                        {Number(expense.amount ?? 0).toFixed(2)} {expense.currency || "TND"}
                      </TableCell>

                      <TableCell>{expense.submittedBy}</TableCell>

                      <TableCell>
                        <Badge className={getStatusBadge(expense.status)}>
                          {expense.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        {expense.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(expense.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(expense.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Total Expenses</div>
            <div className="text-2xl font-bold mt-1">{summary.total.toFixed(2)} TND</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Approved</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {summary.approved.toFixed(2)} TND
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Pending Approval</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">
              {summary.pending.toFixed(2)} TND
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
