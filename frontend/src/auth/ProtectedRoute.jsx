import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    // User is authenticated but wrong role — redirect to their own dashboard
    const dashboards = {
      admin: "/admin/dashboard",
      outside: "/external/dashboard",
      secure: "/internal/dashboard",
    };
    return <Navigate to={dashboards[userRole] || "/login"} replace />;
  }

  return children;
}
