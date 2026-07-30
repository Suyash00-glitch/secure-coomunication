import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import Login from "../components/layout/Login";
import AppLayout from "../components/layout/AppLayout";

import InternalDashboard from "../pages/internal/Dashboard";
import InternalNotifications from "../pages/internal/Notifications";
import InternalTickets from "../pages/internal/Tickets";
import InternalTicketConversation from "../pages/internal/TicketConversation";

import InternalProfile from "../pages/internal/Profile";

/**
 * Route tree for the Internal Vite instance (VITE_PORTAL=internal, port 5174).
 * Only internal paths exist here — no Admin/External routes are imported
 * or mounted in this instance at all.
 */
export default function InternalRoutes({ portal }) {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/internal/login"
        element={
          isAuthenticated ? (
            <Navigate to={portal.dashboardPath} replace />
          ) : (
            <Login lockedPortal="internal" />
          )
        }
      />

      <Route
        path="/internal/*"
        element={
          <ProtectedRoute role="secure" loginPath={portal.loginPath}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InternalDashboard />} />
        <Route path="notifications" element={<InternalNotifications />} />
        <Route path="tickets" element={<InternalTickets />} />
        <Route path="tickets/:id" element={<InternalTicketConversation />} />
 
        <Route path="profile" element={<InternalProfile />} />
        {/* Unknown /internal/* sub-paths — safe fallback instead of a blank page */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Root of this portal instance */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={portal.dashboardPath} replace />
          ) : (
            <Navigate to={portal.loginPath} replace />
          )
        }
      />

      {/* Anything else on this origin — this instance only knows internal
          routes, so it always resolves within the internal portal */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to={portal.dashboardPath} replace />
          ) : (
            <Navigate to={portal.loginPath} replace />
          )
        }
      />
    </Routes>
  );
}
