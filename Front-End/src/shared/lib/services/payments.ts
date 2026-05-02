// src/shared/lib/services/payments.ts

const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:3000/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export const PaymentsApi = {
  confirmPayPalPayment: (
    registrationRequestId: string,
    payload: { orderId: string }
  ) =>
    apiFetch<{
      id: string;
      paymentStatus: string;
      paymentReference: string;
      paymentProvider: string;
    }>(`/registration-requests/${registrationRequestId}/online-payment/confirm`, {
      method: "POST",
      body: JSON.stringify({ provider: "paypal", ...payload }),
    }),
};