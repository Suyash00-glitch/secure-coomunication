export default function Dashboard({
  notificationList,
  tickets,
  setActivePage,
}) {
  const unread = notificationList.filter((n) => n.status === "Unread").length;

  const acknowledged = notificationList.filter(
    (n) => n.status === "Acknowledged",
  ).length;

  const highPriority = notificationList.filter(
    (n) => n.priority === "High",
  ).length;

  const openTickets = tickets.filter((t) => t.status !== "Closed").length;

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>

          <div className="page-sub">
            Welcome back, Priya Sharma — IT Support Department
          </div>
        </div>

        <span
          style={{
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          Mon, 15 Jun 2026
        </span>
      </div>

      {/* STAT CARDS */}

      <div className="stat-grid">
        <div
          className="stat-card"
          style={{
            border: "2px solid #ef4444",
          }}
        >
          <div className="stat-top">
            <div>
              <div className="stat-label">UNREAD NOTIFICATIONS</div>

              <div
                className="stat-val"
                style={{
                  color: "#dc2626",
                }}
              >
                {unread}
              </div>

              <div className="stat-sub">Requires immediate attention</div>
            </div>

            <div
              className="stat-icon"
              style={{
                background: "#fee2e2",
                color: "#dc2626",
              }}
            >
              <i className="ti ti-bell"></i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">TOTAL NOTIFICATIONS</div>

              <div
                className="stat-val"
                style={{
                  color: "#2563eb",
                }}
              >
                {notificationList.length}
              </div>

              <div className="stat-sub">Received this period</div>
            </div>

            <div
              className="stat-icon"
              style={{
                background: "#dbeafe",
                color: "#2563eb",
              }}
            >
              <i className="ti ti-mail"></i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">ACKNOWLEDGED</div>

              <div
                className="stat-val"
                style={{
                  color: "#16a34a",
                }}
              >
                {acknowledged}
              </div>

              <div className="stat-sub">Notifications</div>
            </div>

            <div
              className="stat-icon"
              style={{
                background: "#dcfce7",
                color: "#16a34a",
              }}
            >
              <i className="ti ti-circle-check"></i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">OPEN TICKETS</div>

              <div
                className="stat-val"
                style={{
                  color: "#ca8a04",
                }}
              >
                {openTickets}
              </div>

              <div className="stat-sub">Awaiting action</div>
            </div>

            <div
              className="stat-icon"
              style={{
                background: "#fef3c7",
                color: "#ca8a04",
              }}
            >
              <i className="ti ti-ticket"></i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">HIGH PRIORITY</div>

              <div
                className="stat-val"
                style={{
                  color: "#dc2626",
                }}
              >
                {highPriority}
              </div>

              <div className="stat-sub">Urgent items</div>
            </div>

            <div
              className="stat-icon"
              style={{
                background: "#fee2e2",
                color: "#dc2626",
              }}
            >
              <i className="ti ti-alert-triangle"></i>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}

      <div className="qa-grid">
        <div className="qa-card" onClick={() => setActivePage("notifications")}>
          <i className="ti ti-bell qa-icon"></i>
          <span>View Notifications</span>
        </div>

        <div className="qa-card" onClick={() => setActivePage("tickets")}>
          <i className="ti ti-ticket qa-icon"></i>
          <span>Manage Tickets</span>
        </div>

        <div className="qa-card" onClick={() => setActivePage("activity")}>
          <i className="ti ti-history qa-icon"></i>
          <span>Activity History</span>
        </div>

        <div className="qa-card" onClick={() => setActivePage("profile")}>
          <i className="ti ti-user qa-icon"></i>
          <span>My Profile</span>
        </div>
      </div>
    </div>
  );
}
