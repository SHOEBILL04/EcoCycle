import { Navigate, useLocation } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, the user's role must match this value (or 'admin' always passes). */
  requiredRole?: "moderator" | "admin";
}

/**
 * ProtectedRoute — guards frontend routes against:
 *   1. Unauthenticated access  → redirects to /login
 *   2. Insufficient role       → redirects to /app (dashboard)
 *
 * Role hierarchy:  admin > moderator > citizen
 * An admin can access any role-guarded route.
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem("access_token");
  const role  = localStorage.getItem("role") ?? "citizen";

  // Not authenticated at all
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check — admin bypasses all restrictions
  if (requiredRole && role !== "admin") {
    if (role !== requiredRole) {
      return <Navigate to="/app" replace />;
    }
  }

  return <>{children}</>;
}
