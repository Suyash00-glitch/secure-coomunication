import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const NAV_CONFIG = {
  admin: [
    { id: "dashboard", path: "/admin/dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
    { id: "user-master", path: "/admin/users", icon: "ti-users", label: "User Master", section: "Administration" },
    { id: "dept-master", path: "/admin/departments", icon: "ti-building", label: "Department Master" },
    { id: "ticket-search", path: "/admin/tickets", icon: "ti-search", label: "Ticket Search", section: "Search" },
    { id: "create-ticket", path: "/admin/tickets/create", icon: "ti-plus", label: "Create Ticket" },
    { id: "notif-search", path: "/admin/notifications", icon: "ti-bell", label: "Notification Search" },
    { id: "create-notif", path: "/admin/notifications/create", icon: "ti-send", label: "Create Notification" },
  ],
  outside: [
    { id: "dashboard", path: "/external/dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
    { id: "ticket-list", path: "/external/tickets", icon: "ti-ticket", label: "Ticket List", section: "Tickets" },
    { id: "create-ticket", path: "/external/tickets/create", icon: "ti-plus", label: "Create Ticket" },
    { id: "notif-list", path: "/external/notifications", icon: "ti-bell", label: "Notification List", section: "Notifications" },
    { id: "create-notif", path: "/external/notifications/create", icon: "ti-send", label: "Create Notification" },
  ],
  secure: [
    { id: "dashboard", path: "/internal/dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
    { id: "notifications", path: "/internal/notifications", icon: "ti-bell", label: "Notifications", section: "Inbox", badge: true },
    { id: "tickets", path: "/internal/tickets", icon: "ti-ticket", label: "Tickets", badge: true },
    { id: "activity", path: "/internal/activity", icon: "ti-history", label: "Activity History", section: "Records" },
    { id: "profile", path: "/internal/profile", icon: "ti-user", label: "Profile", section: "Account" },
  ],
};

const PORTAL_INFO = {
  admin: { title: "Admin Portal", sub: "Administration" },
  outside: { title: "External Portal", sub: "Ticket & Notification System" },
  secure: { title: "Department Portal", sub: "Internal Staff" },
};

export default function Sidebar() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = NAV_CONFIG[role] || [];
  const info = PORTAL_INFO[role] || { title: "Portal", sub: "" };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-box">
          <div className="logo-icon">
            <i className="ti ti-building-bank"></i>
          </div>
          <div>
            <div className="logo-text">{info.title}</div>
            <div className="logo-sub">{info.sub}</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <div key={item.id}>
            {item.section && <div className="nav-section">{item.section}</div>}
            <div
              className={`nav-item${location.pathname === item.path ? " active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <i className={`ti ${item.icon}`}></i> {item.label}
              {item.badge && <span className="nav-badge">5</span>}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
