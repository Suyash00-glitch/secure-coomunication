import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import Login from "../components/layout/Login";
import AppLayout from "../components/layout/AppLayout";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminUserMaster from "../pages/admin/UserMaster";
import AdminDepartmentMaster from "../pages/admin/DepartmentMaster";
import AdminTicketSearch from "../pages/admin/TicketSearch";
import AdminNotificationSearch from "../pages/admin/NotificationSearch";
import AdminCreateTicket from "../pages/admin/CreateTicket";
import AdminCreateNotification from "../pages/admin/CreateNotification";
import AdminProfile from "../pages/admin/Profile";

/**
 * Route tree for the Admin Vite instance (VITE_PORTAL=admin, port 5173).
 * Only admin paths exist here — no Internal/External routes are imported
 * or mounted in this instance at all.
 */
export default function AdminRoutes({ portal }) {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/admin/login"
        element={
          isAuthenticated ? (
            <Navigate to={portal.dashboardPath} replace />
          ) : (
            <Login lockedPortal="admin" />
          )
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin" loginPath={portal.loginPath}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUserMaster />} />
        <Route path="departments" element={<AdminDepartmentMaster />} />
        <Route path="tickets" element={<AdminTicketSearch />} />
        <Route path="tickets/create" element={<AdminCreateTicket />} />
        <Route path="notifications" element={<AdminNotificationSearch />} />
        <Route path="notifications/create" element={<AdminCreateNotification />}/>
        
        <Route path="profile" element={<AdminProfile />} />
        {/* Unknown /admin/* sub-paths — safe fallback instead of a blank page */}
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

      


      {/* Anything else on this origin — this instance only knows admin
          routes, so it always resolves within the admin portal */}
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
