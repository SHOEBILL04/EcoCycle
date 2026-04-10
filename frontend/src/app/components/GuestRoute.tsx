import { Navigate } from "react-router";

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute — prevents authenticated users from accessing public pages like Login/SignUp.
 * If authenticated, redirects them to their relevant dashboard.
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role") ?? "citizen";

  if (token) {
    // Redirect to relevant dashboard
    if (role === "admin") {
      return <Navigate to="/app/admin" replace />;
    }
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
