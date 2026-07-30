import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * ProtectedRoute — gates a single portal's authenticated sub-tree.
 *
 * IMPORTANT (fixes the three-port infinite-redirect bug):
 * On a role mismatch this must NEVER redirect to a hardcoded "/login" or to
 * another portal's dashboard. Each Vite instance only mounts ONE portal's
 * routes (see AdminRoutes/InternalRoutes/ExternalRoutes), so a bare
 * "/login" or a foreign "/admin/dashboard"-style path is not a route that
 * exists in this build — it only resolves via this instance's own
 * catch-all "*", which (while still authenticated) sends the user right
 * back to portal.dashboardPath, straight back into this same mismatch
 * branch, forever. That ping-pong between bare <Navigate> elements (no
 * AppLayout/Sidebar ever mounts) is exactly the "Maximum update depth
 * exceeded" / navigation-throttling loop that was reported.
 *
 * Fix: on mismatch, clear the invalid auth state via the existing
 * logout() flow (already disconnects the socket, same as PortalGuard does
 * for cross-portal tokens) and land on *this* portal's own loginPath —
 * which is always a real, declared route — instead of guessing at another
 * role's dashboard.
 */
export default function ProtectedRoute({ role, loginPath = "/login", children }) {
  const { isAuthenticated, role: userRole, logout } = useAuth();

  // Covers both a genuinely wrong role AND the edge case where a token
  // exists but the role hasn't resolved (e.g. missing/corrupted stored
  // user) — either way userRole !== role here.
  const isRoleMismatch = isAuthenticated && !!role && userRole !== role;

  useEffect(() => {
    if (isRoleMismatch) {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoleMismatch]);

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  if (isRoleMismatch) {
    // Render nothing for the single render before logout() (above) clears
    // the token/user. Once cleared, isAuthenticated flips to false and the
    // branch above takes over, sending the user to this portal's own
    // login page — no Navigate to a nonexistent/foreign path, no loop.
    return null;
  }

  return children;
}
