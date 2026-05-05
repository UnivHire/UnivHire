import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, UserRole } from "../store/authStore";

interface Props {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { token, role } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const expanded = allowed.flatMap((r) => (r === "hr" ? ["hr", "admin_hr", "sub_hr"] : [r]));
    if (!role || !expanded.includes(role)) {
      const fallback = role === "hr" || role === "admin_hr" || role === "sub_hr" ? "/hr/dashboard" : role === "admin" ? "/admin" : "/dashboard";
      return <Navigate to={fallback} replace />;
    }
  }

  return <>{children}</>;
}