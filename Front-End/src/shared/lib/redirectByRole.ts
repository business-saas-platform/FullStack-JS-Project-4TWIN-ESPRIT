import type { User } from "@/shared/lib/mockData";

export function redirectByRole(user: User) {
  if (user.role === "platform_admin") return "/admin"; 
  return "/dashboard";
}
