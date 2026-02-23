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
    // keep full location (pathname + search)
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    if (user.role === "platform_admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
