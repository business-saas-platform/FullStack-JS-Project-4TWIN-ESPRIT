import type { User } from "@/shared/lib/mockData";

export function redirectByRole(user: User) {
  if (user.role === "platform_admin") return "/admin";
  // كل الأدوار الباقية يمشيو للـ dashboard
  return "/dashboard";
}
