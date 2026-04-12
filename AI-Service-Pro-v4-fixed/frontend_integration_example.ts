const AI_API = import.meta.env.VITE_AI_API_URL || 'http://localhost:8010/api/v1';

export async function getAISummary(businessId: string) {
  const res = await fetch(`${AI_API}/businesses/${businessId}/summary`);
  if (!res.ok) throw new Error('Failed to load AI summary');
  return res.json();
}

export async function runAIAnalysis(businessId: string) {
  const res = await fetch(`${AI_API}/businesses/${businessId}/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run AI analysis');
  return res.json();
}

export async function getAINotifications(businessId: string) {
  const res = await fetch(`${AI_API}/businesses/${businessId}/notifications`);
  if (!res.ok) throw new Error('Failed to load AI notifications');
  return res.json();
}
