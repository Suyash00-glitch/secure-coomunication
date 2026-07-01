export default function Sidebar({
  activePage,
  setActivePage,
  profile
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-box">
          <div className="logo-icon">🔒</div>

          <div>
            <div className="logo-text">Department Portal</div>

            <div className="logo-sub">Internal Staff</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => setActivePage("dashboard")}
        >
          Dashboard
        </div>

        <div className="nav-section">Inbox</div>

        <div
          className={`nav-item ${
            activePage === "notifications" ? "active" : ""
          }`}
          onClick={() => setActivePage("notifications")}
        >
          Notifications
          <span className="nav-badge">5</span>
        </div>

        <div
          className={`nav-item ${activePage === "tickets" ? "active" : ""}`}
          onClick={() => setActivePage("tickets")}
        >
          Tickets
          <span className="nav-badge">5</span>
        </div>

        <div className="nav-section">Records</div>

        <div
          className={`nav-item ${activePage === "activity" ? "active" : ""}`}
          onClick={() => setActivePage("activity")}
        >
          Activity History
        </div>

        <div className="nav-section">Account</div>

        <div
          className={`nav-item ${activePage === "profile" ? "active" : ""}`}
          onClick={() => setActivePage("profile")}
        >
          Profile
        </div>
      </nav>

      <div className="sidebar-footer">
  <div className="staff-meta">
    <div className="staff-avatar-sm">
      {profile?.name
        ? profile.name.charAt(0).toUpperCase()
        : "?"}
    </div>

    <div>
      <div className="staff-name-sm">
        {profile?.name || "Loading..."}
      </div>

      <div className="staff-role-sm">
        {profile?.department_name || ""}
      </div>
    </div>
  </div>
</div>
    </div>
  );
}
