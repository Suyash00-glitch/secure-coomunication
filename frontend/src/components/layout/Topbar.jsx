import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import Modal from "../shared/Modal";

const PAGE_META = {
  // Admin
  "/admin/dashboard": { section: "Home", name: "Dashboard" },
  "/admin/users": { section: "Administration", name: "User Master" },
  "/admin/departments": {
    section: "Administration",
    name: "Department Master",
  },
  "/admin/tickets": { section: "Search", name: "Ticket Search" },
  "/admin/tickets/create": { section: "Tickets", name: "Create Ticket" },
  "/admin/notifications": { section: "Search", name: "Notification Search" },
  "/admin/notifications/create": {
    section: "Notifications",
    name: "Create Notification",
  },
  // External
  "/external/dashboard": { section: "Home", name: "Dashboard" },
  "/external/tickets": { section: "Tickets", name: "Ticket List" },
  "/external/tickets/create": { section: "Tickets", name: "Create Ticket" },
  "/external/notifications": {
    section: "Notifications",
    name: "Notification List",
  },
  "/external/notifications/create": {
    section: "Notifications",
    name: "Create Notification",
  },
  // Internal
  "/internal/dashboard": { section: "Home", name: "Dashboard" },
  "/internal/notifications": { section: "Inbox", name: "Notifications" },
  "/internal/tickets": { section: "Inbox", name: "Tickets" },
  "/internal/activity": { section: "Records", name: "Activity History" },
  "/internal/profile": { section: "Account", name: "Profile" },
};

export default function Topbar() {
  const { user, logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleProfileClick = () => {
    if (role === "secure") {
      navigate("/internal/profile");
    } else if (role === "outside") {
      navigate("/external/dashboard");
    } else if (role === "admin") {
      navigate("/admin/dashboard");
    }
  };

  const meta = PAGE_META[location.pathname] || { section: "", name: "" };
  const displayName = user?.username || "User";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="topbar">
      <div>
        <span className="breadcrumb">
          {meta.section} / <span>{meta.name}</span>
        </span>
      </div>
      <div className="topbar-right">
        <div
          className="avatar"
          title={displayName}
          onClick={handleProfileClick}
          style={{ cursor: "pointer" }}
        >
          {initials}
        </div>
        <button className="btn-logout" onClick={() => setShowLogout(true)}>
          Logout
        </button>
      </div>

      {showLogout && (
        <Modal
          title="Confirm Logout"
          onClose={() => setShowLogout(false)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={logout}>
                Logout
              </button>
            </>
          }
        >
          <p>Are you sure you want to logout?</p>
        </Modal>
      )}
    </div>
  );
}
