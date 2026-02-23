import type { Business } from "@/shared/lib/mockData";
import { api } from "@/shared/lib/apiClient";

export const BusinessesApi = {
  // Backend currently: GET /businesses (owner businesses)
  listMine: () => api<Business[]>("/businesses"),

  getById: (id: string) => api<Business>(`/businesses/${id}`),

  create: (payload: Partial<Business>) =>
    api<Business>("/businesses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<Business>) =>
    api<Business>(`/businesses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    api<{ ok?: boolean; deleted?: boolean; id?: string }>(`/businesses/${id}`, {
      method: "DELETE",
    }),

  // ✅ ONLY UPDATED: added tax fields to payload typing
  completeProfile: (
    id: string,
    payload: {
      logoUrl?: string;
      taxId?: string;
      address?: string;
      phone?: string;

      // ✅ tax fields
      currency?: string;
      fiscalYearStart?: string; // "YYYY-MM-DD"
      taxRate?: number;         // e.g. 19
      registrationNumber?: string;
    }
  ) =>
    api<Business>(`/businesses/${id}/profile`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};