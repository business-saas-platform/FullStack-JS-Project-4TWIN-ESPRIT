import { api } from "@/shared/lib/apiClient";

export const AiApi = {
  getRisk: (clientId: string) =>
    api(`/ai/risk/${clientId}`),
};

