import type { Client } from "@/shared/lib/mockData";
import { api } from "@/shared/lib/apiClient";

export type CreateClientPayload = {
  businessId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  taxId?: string;
  type?: "individual" | "company";
  status?: "active" | "inactive";
  notes?: string;
};

export const ClientsApi = {
  list: (businessId: string) =>
    api<Client[]>(`/clients?businessId=${businessId}`),

  create: (payload: CreateClientPayload) =>
    api<Client>(`/clients`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
