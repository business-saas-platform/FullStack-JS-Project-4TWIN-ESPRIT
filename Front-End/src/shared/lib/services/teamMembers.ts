import { api } from "@/shared/lib/apiClient";

export const TeamMembersApi = {
  list: (businessId: string) =>
    api(`/team-members?businessId=${encodeURIComponent(businessId)}`),

  // ✅ نفس create
  create: (payload: any) =>
    api(`/team-members`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ✅ alias invite
   invite: (payload: any) =>
    api(`/team-members/invite`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    api(`/team-members/${id}`, { method: "DELETE" }),

  update: (id: string, payload: any) =>
    api(`/team-members/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
