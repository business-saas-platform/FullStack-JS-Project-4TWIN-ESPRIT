const AI_BASE =
  import.meta.env.VITE_AI_API_URL || "http://127.0.0.1:8010/api/v1";

async function aiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${AI_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export const AIService = {
  runAnalysis: (businessId: string) =>
    aiFetch(`/businesses/${businessId}/run`, { method: "POST" }),

  getSummary: (businessId: string) =>
    aiFetch(`/businesses/${businessId}/summary`),
};