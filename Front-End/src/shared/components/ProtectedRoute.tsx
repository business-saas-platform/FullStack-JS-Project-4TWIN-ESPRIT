import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";

type Props = {
  roles?: string[];
  children: React.ReactNode;
};

export function ProtectedRoute({ roles, children }: Props) {
  const { user, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) return null;

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // ── Force password change on first login ──
  if (user.mustChangePassword && location.pathname !== "/auth/change-password") {
    return <Navigate to="/auth/change-password" replace />;
  }

  // ── Force security questions setup after password change ──
  if (
    !user.mustChangePassword &&
    !(user as any).hasSecurityQuestions &&
    location.pathname !== "/auth/setup-security-questions"
  ) {
    // only redirect if we know they haven't set up questions yet
    // we'll handle this check in the setup page itself
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    if (user.role === "platform_admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}