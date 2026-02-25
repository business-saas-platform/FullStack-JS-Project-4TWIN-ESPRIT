import { useAuth } from "@/shared/contexts/AuthContext";

export function usePermission(permission: string) {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}