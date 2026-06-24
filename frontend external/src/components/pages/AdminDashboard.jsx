/**
 * Admin Dashboard — placeholder page for admin users.
 * TODO: Connect to backend admin endpoints when available.
 * Expected: Admin-specific stats, user management, system overview.
 */
export default function AdminDashboard({ user }) {
  const displayName = user?.name || "Admin";

  return (
    <div className={true ? "page active" : "page"} id="page-admin-dashboard">
      <div className="page-header">
        <div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-sub">Welcome, {displayName} — System Administrator</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Administration Panel</span>
        </div>
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#6b7280" }}>
          <i className="ti ti-shield-check" style={{ fontSize: 48, color: "#1a73e8", marginBottom: 16 }}></i>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Admin Portal</p>
          <p style={{ fontSize: 13 }}>
            This section is reserved for system administrators.
          </p>
          <p style={{ fontSize: 12, marginTop: 16, color: "#9ca3af" }}>
            {/* TODO: Implement admin dashboard with backend integration */}
            Admin features will be connected here:
            <br />• User management across all roles
            <br />• Department configuration
            <br />• System-wide ticket oversight
            <br />• Notification management
            <br />• Audit logs and system settings
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Stats</span>
          </div>
          <div style={{ padding: "20px 0" }}>
            {/* TODO: Fetch admin stats from backend */}
            <div style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
              Admin statistics will appear here once connected to backend
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Admin Actions</span>
          </div>
          <div style={{ padding: "20px 0" }}>
            {/* TODO: Fetch recent admin actions from backend */}
            <div style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
              Admin activity log will appear here once connected to backend
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
