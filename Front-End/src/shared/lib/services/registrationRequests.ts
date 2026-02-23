import { api } from "../apiClient";

export type RegistrationRequestStatus = "pending" | "approved" | "rejected";

export type RegistrationRequest = {
  id: string;
  ownerName: string;
  ownerEmail: string;
  companyName: string;
  companyCategory: string;
  companyPhone?: string | null;
  companyAddress?: string | null;
  companyTaxId?: string | null;

  status: RegistrationRequestStatus;
  rejectionReason?: string | null;

  createdAt: string;
  updatedAt?: string;
};

export const RegistrationRequestsApi = {
  // Public (owner request)
  create: (payload: {
    ownerName: string;
    ownerEmail: string;
    companyName: string;
    companyCategory: string;
    companyPhone?: string;
    companyAddress?: string;
    companyTaxId?: string;
  }) =>
    api<{ ok: true; id: string; status: RegistrationRequestStatus }>(
      "/registration-requests",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  // Admin (list)
  list: (status: RegistrationRequestStatus = "pending") =>
    api<RegistrationRequest[]>(`/registration-requests?status=${status}`),

  // Admin (approve)
  approve: (id: string) =>
    api<{ ok: true }>(`/registration-requests/${id}/approve`, {
      method: "POST",
    }),

  // Admin (reject)
  reject: (id: string, reason: string) =>
    api<{ ok: true }>(`/registration-requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
