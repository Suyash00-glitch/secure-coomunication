import { useState } from "react";
import { getToken } from "./api/client";
import Login from "./components/layout/Login";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./components/pages/Dashboard";
import TicketList from "./components/pages/TicketList";
import CreateTicket from "./components/pages/CreateTicket";
import TicketDetail from "./components/pages/TicketDetail";
import NotificationList from "./components/pages/NotificationList";
import CreateNotification from "./components/pages/CreateNotification";
import NotificationDetail from "./components/pages/NotificationDetail";
import UserMaster from "./components/pages/UserMaster";
import DepartmentMaster from "./components/pages/DepartmentMaster";
import AdminDashboard from "./components/pages/AdminDashboard";

/**
 * App shell — manages auth state, current page, and routes to page components.
 * All function names (showApp, showLogin, showPage, openTick, openNotif, etc.)
 * are preserved from the original prototype.
 *
 * Admin users are routed to a separate admin dashboard.
 */
export default function App() {
  // ── login / app shell ──────────────────────────────────────────
  const [loggedIn, setLoggedIn] = useState(() => !!getToken());
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Check if the logged-in user has admin role
  const isAdmin = user?.role === "Admin" || user?.role === "admin";

  function showApp(data) {
    const userData = data?.user || data || null;
    setUser(userData);
    setLoggedIn(true);
    // Route admins to admin dashboard
    if (userData?.role === "Admin" || userData?.role === "admin") {
      setCurrentPage("admin-dashboard");
    }
  }
  function showLogin() {
    localStorage.removeItem("token");
    setUser(null);
    setLoggedIn(false);
    setCurrentPage("dashboard");
  }
  function showPage(id) {
    setCurrentPage(id);
  }

  // ── ticket detail ──────────────────────────────────────────────
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  function openTicket(ticketId) {
    setSelectedTicketId(ticketId);
    showPage("ticket-detail");
  }

  // ── ticket list navigation ─────────────────────────────────────
  function openTick() {
    showPage("ticket-list");
  }

  // ── notification detail ────────────────────────────────────────
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  function openNotification(id) {
    setSelectedNotificationId(id);
    showPage("notif-detail");
  }

  // ── notification list navigation ───────────────────────────────
  function openNotif() {
    showPage("notif-list");
  }

  // ── sidebar navigation handler ─────────────────────────────────
  function handleNavigate(id) {
    // Some pages need data pre-loading (handled inside their own components)
    if (id === "ticket-list") {
      openTick();
    } else if (id === "notif-list") {
      openNotif();
    } else {
      showPage(id);
    }
  }

  // ════════════════════════════════════════════════════════════════
  if (!loggedIn) {
    return <Login onLogin={showApp} />;
  }

  // ── Admin view ─────────────────────────────────────────────────
  if (isAdmin) {
    return (
      <div id="main-app">
        <div className="app">
          <div className="main" style={{ flex: 1 }}>
            <Topbar currentPage="admin-dashboard" user={user} onLogout={showLogin} />
            <div className="content">
              <AdminDashboard user={user} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Regular user view ──────────────────────────────────────────
  return (
    <div id="main-app">
      <div className="app">
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

        <div className="main">
          <Topbar currentPage={currentPage} user={user} onLogout={showLogin} />

          <div className="content">
            {currentPage === "dashboard" && (
              <Dashboard user={user} onNavigate={showPage} />
            )}

            {currentPage === "ticket-list" && (
              <TicketList onNavigate={showPage} onOpenTicket={openTicket} />
            )}

            {currentPage === "create-ticket" && (
              <CreateTicket onNavigate={showPage} />
            )}

            {currentPage === "ticket-detail" && (
              <TicketDetail ticketId={selectedTicketId} onNavigate={showPage} />
            )}

            {currentPage === "notif-list" && (
              <NotificationList onNavigate={showPage} onOpenNotification={openNotification} />
            )}

            {currentPage === "create-notif" && (
              <CreateNotification onNavigate={showPage} />
            )}

            {currentPage === "notif-detail" && (
              <NotificationDetail notificationId={selectedNotificationId} />
            )}

            {currentPage === "user-master" && (
              <UserMaster />
            )}

            {currentPage === "dept-master" && (
              <DepartmentMaster />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
