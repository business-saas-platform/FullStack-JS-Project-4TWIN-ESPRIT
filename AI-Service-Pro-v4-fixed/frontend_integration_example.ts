const AI_API = import.meta.env.VITE_AI_API_URL || 'http://localhost:8010/api/v1';

export type AINotification = {
  id: string;
  businessId: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  createdAt: string;
  channel: 'dashboard' | 'email' | 'dashboard_email';
  sent: boolean;
  read: boolean;
  category: 'revenue' | 'expenses' | 'clients' | 'cash_flow' | 'invoices' | 'system';
  priority: number;
  actionLabel?: string | null;
  actionUrl?: string | null;
  source: string;
  score?: number | null;
  meta: Record<string, unknown>;
};



export type AICoachAdvice = {
  id: string;
  businessId: string;
  title: string;
  message: string;
  category: 'growth' | 'risk' | 'cashflow' | 'clients' | 'operations' | 'invoices' | 'expenses';
  priority: 'low' | 'medium' | 'high';
  action?: string | null;
  actionUrl?: string | null;
  score?: number | null;
  createdAt: string;
};

export type AICoachResponse = {
  businessId: string;
  generatedAt: string;
  total: number;
  highPriority: number;
  items: AICoachAdvice[];
};

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${AI_API}${path}`, options);
  if (!res.ok) throw new Error(`AI API error ${res.status}`);
  return res.json();
}

export async function getAISummary(businessId: string) {
  return api(`/businesses/${businessId}/summary`);
}

export async function runAIAnalysis(businessId: string) {
  return api(`/businesses/${businessId}/run`, { method: 'POST' });
}


export async function getAICoach(businessId: string) {
  return api<AICoachResponse>(`/businesses/${businessId}/ai-coach`);
}

export async function getAINotifications(
  businessId: string,
  options: { includeRead?: boolean; limit?: number } = {},
) {
  const params = new URLSearchParams({
    include_read: String(options.includeRead ?? true),
    limit: String(options.limit ?? 50),
  });
  return api<{ businessId: string; total: number; unread: number; items: AINotification[] }>(
    `/businesses/${businessId}/notifications?${params}`,
  );
}

export async function getAIUnreadCount(businessId: string) {
  return api<{ businessId: string; unread: number }>(`/businesses/${businessId}/notifications/unread-count`);
}

export async function markAINotificationRead(businessId: string, notificationId: string) {
  return api(`/businesses/${businessId}/notifications/${notificationId}/read`, { method: 'PATCH' });
}

export async function markAllAINotificationsRead(businessId: string) {
  return api(`/businesses/${businessId}/notifications/read-all`, { method: 'PATCH' });
}

export async function deleteAINotification(businessId: string, notificationId: string) {
  return api(`/businesses/${businessId}/notifications/${notificationId}`, { method: 'DELETE' });
}

export async function clearAINotifications(businessId: string, onlyRead = false) {
  return api(`/businesses/${businessId}/notifications?only_read=${onlyRead}`, { method: 'DELETE' });
}
