import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./components/layout/Login";
import AppLayout from "./components/layout/AppLayout";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUserMaster from "./pages/admin/UserMaster";
import AdminDepartmentMaster from "./pages/admin/DepartmentMaster";
import AdminTicketSearch from "./pages/admin/TicketSearch";
import AdminNotificationSearch from "./pages/admin/NotificationSearch";
import AdminCreateTicket from "./pages/admin/CreateTicket";
import AdminCreateNotification from "./pages/admin/CreateNotification";

// External pages
import ExternalDashboard from "./pages/external/Dashboard";
import ExternalTicketList from "./pages/external/TicketList";
import ExternalCreateTicket from "./pages/external/CreateTicket";
import ExternalTicketDetail from "./pages/external/TicketDetail";
import ExternalNotificationList from "./pages/external/NotificationList";
import ExternalCreateNotification from "./pages/external/CreateNotification";
import ExternalNotificationDetail from "./pages/external/NotificationDetail";

// Internal pages
import InternalDashboard from "./pages/internal/Dashboard";
import InternalNotifications from "./pages/internal/Notifications";
import InternalTickets from "./pages/internal/Tickets";
import InternalTicketConversation from "./pages/internal/TicketConversation";
import InternalActivityHistory from "./pages/internal/ActivityHistory";
import InternalProfile from "./pages/internal/Profile";

export default function App() {
  const { isAuthenticated, role } = useAuth();

  // If authenticated and hitting /login or /, redirect to role dashboard
  const roleDashboards = {
    admin: "/admin/dashboard",
    outside: "/external/dashboard",
    secure: "/internal/dashboard",
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={roleDashboards[role] || "/login"} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin">
            <AppLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUserMaster />} />
        <Route path="departments" element={<AdminDepartmentMaster />} />
        <Route path="tickets" element={<AdminTicketSearch />} />
        <Route path="tickets/create" element={<AdminCreateTicket />} />
        <Route path="notifications" element={<AdminNotificationSearch />} />
        <Route path="notifications/create" element={<AdminCreateNotification />} />
      </Route>

      {/* External routes */}
      <Route
        path="/external/*"
        element={
          <ProtectedRoute role="outside">
            <AppLayout role="outside" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ExternalDashboard />} />
        <Route path="tickets" element={<ExternalTicketList />} />
        <Route path="tickets/create" element={<ExternalCreateTicket />} />
        <Route path="tickets/:id" element={<ExternalTicketDetail />} />
        <Route path="notifications" element={<ExternalNotificationList />} />
        <Route path="notifications/create" element={<ExternalCreateNotification />} />
        <Route path="notifications/:id" element={<ExternalNotificationDetail />} />
      </Route>

      {/* Internal routes */}
      <Route
        path="/internal/*"
        element={
          <ProtectedRoute role="secure">
            <AppLayout role="secure" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<InternalDashboard />} />
        <Route path="notifications" element={<InternalNotifications />} />
        <Route path="tickets" element={<InternalTickets />} />
        <Route path="tickets/:id" element={<InternalTicketConversation />} />
        <Route path="activity" element={<InternalActivityHistory />} />
        <Route path="profile" element={<InternalProfile />} />
      </Route>

      {/* Default redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={roleDashboards[role] || "/login"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
