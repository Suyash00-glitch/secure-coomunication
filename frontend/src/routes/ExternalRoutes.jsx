import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import Login from "../components/layout/Login";
import AppLayout from "../components/layout/AppLayout";

import ExternalDashboard from "../pages/external/Dashboard";
import ExternalTicketList from "../pages/external/TicketList";
import ExternalCreateTicket from "../pages/external/CreateTicket";
import ExternalTicketDetail from "../pages/external/TicketDetail";
import ExternalNotificationList from "../pages/external/NotificationList";
import ExternalCreateNotification from "../pages/external/CreateNotification";
import ExternalNotificationDetail from "../pages/external/NotificationDetail";

/**
 * Route tree for the External Vite instance (VITE_PORTAL=external, port 5175).
 * Only external paths exist here — no Admin/Internal routes are imported
 * or mounted in this instance at all.
 */
export default function ExternalRoutes({ portal }) {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/external/login"
        element={
          isAuthenticated ? (
            <Navigate to={portal.dashboardPath} replace />
          ) : (
            <Login lockedPortal="external" />
          )
        }
      />

      <Route
        path="/external/*"
        element={
          <ProtectedRoute role="outside" loginPath={portal.loginPath}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ExternalDashboard />} />
        <Route path="tickets" element={<ExternalTicketList />} />
        <Route path="tickets/create" element={<ExternalCreateTicket />} />
        <Route path="tickets/:id" element={<ExternalTicketDetail />} />
        <Route path="notifications" element={<ExternalNotificationList />} />
        <Route
          path="notifications/create"
          element={<ExternalCreateNotification />}
        />
        <Route
          path="notifications/:id"
          element={<ExternalNotificationDetail />}
        />
        {/* Unknown /external/* sub-paths — safe fallback instead of a blank page */}
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

      {/* Anything else on this origin — this instance only knows external
          routes, so it always resolves within the external portal */}
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
