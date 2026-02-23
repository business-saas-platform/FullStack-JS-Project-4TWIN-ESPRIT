const BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL || // ✅ support both env names
  "http://localhost:3000/api";

export function getToken() {
  return localStorage.getItem("access_token");
}

type ApiOptions = RequestInit & {
  headers?: Record<string, string> | Headers;
};

function normalizeHeaders(h?: Record<string, string> | Headers) {
  if (!h) return {};
  if (h instanceof Headers) {
    const obj: Record<string, string> = {};
    h.forEach((v, k) => (obj[k] = v));
    return obj;
  }
  return h;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken();

    const businessId = localStorage.getItem("current_business_id");
const extraHeaders = normalizeHeaders(options.headers);

  const headers: Record<string, string> = {
    // ✅ keep json by default
    "Content-Type": "application/json",
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(businessId ? { "x-business-id": businessId } : {}),
};

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  // ✅ handle empty responses (204 / empty body)
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data: any = null;

  if (res.status !== 204) {
    try {
      data = isJson ? await res.json() : await res.text();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;

    // NestJS often returns { message: string | string[] }
    if (data) {
      if (typeof data === "string") msg = data;
      else if (Array.isArray(data?.message)) msg = data.message.join(", ");
      else if (data?.message) msg = data.message;
      else if (data?.error) msg = data.error;
    }

    throw new Error(msg);
  }

  // ✅ if not json (text) return as any
  if (!isJson) return data as T;

  return (data ?? undefined) as T;
}

export const apiGet = <T>(path: string) => api<T>(path, { method: "GET" });

export const apiPost = <T>(path: string, body?: any) =>
  api<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const apiPatch = <T>(path: string, body?: any) =>
  api<T>(path, {
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const apiDelete = <T>(path: string) => api<T>(path, { method: "DELETE" });