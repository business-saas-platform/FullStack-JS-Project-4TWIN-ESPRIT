import type { Expense } from "@/shared/lib/mockData";
import { api } from "@/shared/lib/apiClient";

export type CreateExpensePayload = {
  businessId: string;
  date: string;
  amount: number;
  currency: string;
  category: string;
  vendor: string;
  description: string;
  paymentMethod: string;
  status?: "pending" | "approved" | "rejected";
  receiptUrl?: string;
  submittedBy: string;
};

export const ExpensesApi = {
  list: (businessId: string) =>
    api<Expense[]>(`/expenses?businessId=${businessId}`),

  create: (payload: CreateExpensePayload) =>
    api<Expense>(`/expenses`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: string, status: "approved" | "rejected") =>
    api<Expense>(`/expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
