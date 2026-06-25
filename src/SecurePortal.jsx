import { useState } from "react";

export default function SecurePortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [notificationList, setNotificationList] = useState([
    {
      id: "NTF-0031",
      sender: "Arjun Patel",
      subject: "System Login Failure — Unable to Access Portal",
      datetime: "15 Jun 2026, 09:12 AM",
      priority: "High",
      status: "Unread",
    },
    {
      id: "NTF-0030",
      sender: "Meena Krishnan",
      subject: "Budget Variance Report — June 2026",
      datetime: "14 Jun 2026, 03:45 PM",
      priority: "Medium",
      status: "Acknowledged",
    },
    {
      id: "NTF-0029",
      sender: "Rajan Mehendale",
      subject: "Field Operations Delay — Vendor Non-Compliance",
      datetime: "13 Jun 2026, 11:00 AM",
      priority: "High",
      status: "Unread",
    },
    {
      id: "NTF-0028",
      sender: "Suresh Nair",
      subject: "Leave Encashment Query",
      datetime: "12 Jun 2026, 01:20 PM",
      priority: "Low",
      status: "Unread",
    },
    {
      id: "NTF-0027",
      sender: "Kavya Nair",
      subject: "Contract Amendment Request",
      datetime: "11 Jun 2026, 10:30 AM",
      priority: "High",
      status: "Unread",
    },
  ]);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const [showForwardModal, setShowForwardModal] = useState(false);

  const [toast, setToast] = useState("");

  const tickets = [
    {
      id: "TKT-0092",
      user: "Meena Krishnan",
      issue: "System Login Failure",
      priority: "High",
      status: "Open",
      updated: "15 Jun 2026, 08:47 AM",
      attach: true,
    },
    {
      id: "TKT-0091",
      user: "Arjun Patel",
      issue: "VPN Access Unavailable",
      priority: "Medium",
      status: "In Progress",
      updated: "14 Jun 2026, 04:10 PM",
      attach: false,
    },
    {
      id: "TKT-0090",
      user: "Rajan Mehendale",
      issue: "Payroll Slip Not Generated",
      priority: "Medium",
      status: "In Progress",
      updated: "13 Jun 2026, 02:30 PM",
      attach: true,
    },
    {
      id: "TKT-0089",
      user: "Suresh Nair",
      issue: "Leave Application Rejected",
      priority: "Low",
      status: "Closed",
      updated: "13 Jun 2026, 10:22 AM",
      attach: false,
    },
    {
      id: "TKT-0088",
      user: "Kavya Nair",
      issue: "Expense Reimbursement Pending",
      priority: "High",
      status: "Open",
      updated: "12 Jun 2026, 03:45 PM",
      attach: true,
    },
  ];

  const ticketTimeline = {
    "TKT-0092": [
      {
        time: "15 Jun 2026, 08:47 AM",
        action: "Ticket created by Meena Krishnan",
      },
      {
        time: "15 Jun 2026, 08:55 AM",
        action: "Assigned to IT Support Department",
      },
      {
        time: "15 Jun 2026, 09:10 AM",
        action: "Priya Sharma acknowledged the ticket",
      },
      {
        time: "15 Jun 2026, 09:45 AM",
        action: "Investigating authentication logs",
      },
      {
        time: "15 Jun 2026, 10:20 AM",
        action: "Awaiting additional information from user",
      },
    ],

    "TKT-0091": [
      {
        time: "14 Jun 2026, 04:10 PM",
        action: "Ticket created by Arjun Patel",
      },
      { time: "14 Jun 2026, 04:25 PM", action: "Assigned to Network Team" },
      {
        time: "14 Jun 2026, 05:00 PM",
        action: "VPN configuration under review",
      },
    ],

    "TKT-0090": [
      { time: "13 Jun 2026, 02:30 PM", action: "Payroll issue reported" },
      { time: "13 Jun 2026, 03:10 PM", action: "Finance department notified" },
    ],

    "TKT-0089": [
      { time: "13 Jun 2026, 10:22 AM", action: "Issue resolved" },
      { time: "13 Jun 2026, 10:45 AM", action: "User confirmed resolution" },
      { time: "13 Jun 2026, 11:00 AM", action: "Ticket closed" },
    ],

    "TKT-0088": [
      {
        time: "12 Jun 2026, 03:45 PM",
        action: "Expense reimbursement request received",
      },
      {
        time: "12 Jun 2026, 04:10 PM",
        action: "Forwarded to Finance Department",
      },
    ],
  };

  const pageTitle = {
    dashboard: "Dashboard",
    notifications: "Notifications",
    tickets: "Tickets",
    activity: "Activity History",
    profile: "Profile",
  };
  const acknowledgeNotification = (id) => {
    setNotificationList(
      notificationList.map((n) =>
        n.id === id ? { ...n, status: "Acknowledged" } : n,
      ),
    );

    setToast("Notification acknowledged");

    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  if (!loggedIn) {
    return (
      <div id="login-screen">
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-logo">
              <div className="login-logo-icon">🔒</div>

              <div className="login-badge">Internal Staff Portal</div>

              <h2>Department Portal</h2>

              <p>Secure Ticketing & Notification Management</p>
            </div>

            <div className="form-group">
              <label className="form-label">Staff Username</label>

              <input className="form-input" defaultValue="priya.sharma" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>

              <input
                className="form-input"
                type="password"
                defaultValue="password"
              />
            </div>

            <button
              className="btn-primary-full"
              onClick={() => setLoggedIn(true)}
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="main-app">
      <div className="app">
        {/* SIDEBAR */}

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
              className={`nav-item ${
                activePage === "dashboard" ? "active" : ""
              }`}
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
              className={`nav-item ${
                activePage === "activity" ? "active" : ""
              }`}
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
              <div className="staff-avatar-sm">PS</div>

              <div>
                <div className="staff-name-sm">Priya Sharma</div>

                <div className="staff-role-sm">IT Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}

        <div className="main">
          <div className="topbar">
            <span className="breadcrumb">
              Home /<span> {pageTitle[activePage]}</span>
            </span>

            <div className="topbar-right">
              <div className="topbar-avatar">PS</div>

              <span className="topbar-username">Priya Sharma</span>

              <button className="btn-logout" onClick={() => setLoggedIn(false)}>
                Logout
              </button>
            </div>
          </div>

          <div className="content">
            {activePage === "dashboard" && (
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
                      fontSize: "13px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    Mon, 15 Jun 2026
                  </span>
                </div>

                {/* STATISTICS */}

                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-top">
                      <div>
                        <div className="stat-label">UNREAD NOTIFICATIONS</div>

                        <div className="stat-val" style={{ color: "#dc2626" }}>
                          3
                        </div>

                        <div className="stat-sub">
                          Requires immediate attention
                        </div>
                      </div>

                      <div
                        className="stat-icon"
                        style={{
                          background: "#ede9fe",
                          color: "#7c3aed",
                        }}
                      >
                        <i className="ti ti-bell"></i>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-top">
                      <div>
                        <div className="stat-label">TOTAL TICKETS</div>

                        <div className="stat-val" style={{ color: "#2563eb" }}>
                          5
                        </div>

                        <div className="stat-sub">All from external</div>
                      </div>

                      <div
                        className="stat-icon"
                        style={{
                          background: "#dbeafe",
                          color: "#2563eb",
                        }}
                      >
                        <i className="ti ti-ticket"></i>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-top">
                      <div>
                        <div className="stat-label">ACKNOWLEDGED</div>

                        <div className="stat-val" style={{ color: "#16a34a" }}>
                          2
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
                        <div className="stat-label">PENDING ACTION</div>

                        <div className="stat-val" style={{ color: "#d97706" }}>
                          4
                        </div>

                        <div className="stat-sub">Require response</div>
                      </div>

                      <div
                        className="stat-icon"
                        style={{
                          background: "#fef3c7",
                          color: "#d97706",
                        }}
                      >
                        <i className="ti ti-clock-hour-3"></i>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-top">
                      <div>
                        <div className="stat-label">HIGH PRIORITY</div>

                        <div className="stat-val" style={{ color: "#dc2626" }}>
                          3
                        </div>

                        <div className="stat-sub">Combined urgent</div>
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
                  <div
                    className="qa-card"
                    onClick={() => setActivePage("notifications")}
                  >
                    <i className="ti ti-bell qa-icon"></i>
                    <span>View Notifications</span>
                  </div>

                  <div
                    className="qa-card"
                    onClick={() => setActivePage("tickets")}
                  >
                    <i className="ti ti-ticket qa-icon"></i>
                    <span>Manage Tickets</span>
                  </div>

                  <div
                    className="qa-card"
                    onClick={() => setActivePage("activity")}
                  >
                    <i className="ti ti-history qa-icon"></i>
                    <span>Activity History</span>
                  </div>

                  <div
                    className="qa-card"
                    onClick={() => setActivePage("profile")}
                  >
                    <i className="ti ti-user-circle qa-icon"></i>
                    <span>My Profile</span>
                  </div>
                </div>

                {/* LOWER SECTION */}

                <div className="dash-bottom">
                  <div className="activity-card">
                    <div className="card-header">
                      <span className="card-title">Recent Activity</span>

                      <span className="small-text">Last 7 Days</span>
                    </div>

                    <div className="activity-item">
                      🔔 Notification NTF-0031 received from Arjun Patel
                      <div className="activity-time">1 hour ago</div>
                    </div>

                    <div className="activity-item">
                      🎫 Ticket TKT-0092 opened by Meena Krishnan
                      <div className="activity-time">3 hours ago</div>
                    </div>

                    <div className="activity-item">
                      ✓ Ticket TKT-0089 resolved successfully
                      <div className="activity-time">Yesterday</div>
                    </div>

                    <div className="activity-item">
                      ↪ Notification NTF-0029 forwarded
                      <div className="activity-time">2 days ago</div>
                    </div>
                  </div>

                  <div className="status-card">
                    <div className="card-header">
                      <span className="card-title">Status Overview</span>
                    </div>

                    <div className="status-row">
                      <span>Unread</span>
                      <div className="progress">
                        <div
                          className="progress-fill purple"
                          style={{ width: "75%" }}
                        />
                      </div>
                      <span>3</span>
                    </div>

                    <div className="status-row">
                      <span>Acknowledged</span>
                      <div className="progress">
                        <div
                          className="progress-fill green"
                          style={{ width: "35%" }}
                        />
                      </div>
                      <span>1</span>
                    </div>

                    <div className="status-row">
                      <span>Pending</span>
                      <div className="progress">
                        <div
                          className="progress-fill orange"
                          style={{ width: "30%" }}
                        />
                      </div>
                      <span>1</span>
                    </div>

                    <hr
                      style={{
                        margin: "18px 0",
                        border: "none",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    />

                    <div className="status-row">
                      <span>Open</span>
                      <div className="progress">
                        <div
                          className="progress-fill blue"
                          style={{ width: "60%" }}
                        />
                      </div>
                      <span>2</span>
                    </div>

                    <div className="status-row">
                      <span>In Progress</span>
                      <div className="progress">
                        <div
                          className="progress-fill orange"
                          style={{ width: "60%" }}
                        />
                      </div>
                      <span>2</span>
                    </div>

                    <div className="status-row">
                      <span>Closed</span>
                      <div className="progress">
                        <div
                          className="progress-fill green"
                          style={{ width: "30%" }}
                        />
                      </div>
                      <span>1</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePage === "notifications" && (
              <div className="page active">
                <div className="page-header">
                  <div>
                    <div className="page-title">Notifications Received</div>

                    <div className="page-sub">
                      Incoming notifications from external users
                    </div>
                  </div>

                  <button className="btn btn-primary">Mark All Read</button>
                </div>

                <div className="card">
                  <div className="search-row">
                    <div className="search-wrap">
                      <input
                        className="search-input"
                        placeholder="Search by ID, sender, subject..."
                      />
                    </div>

                    <select className="filter-select">
                      <option>All Statuses</option>
                      <option>Unread</option>
                      <option>Acknowledged</option>
                    </select>

                    <select className="filter-select">
                      <option>All Priorities</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Notification ID</th>
                          <th>Sender</th>
                          <th>Subject</th>
                          <th>Date & Time</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {notificationList.map((n) => (
                          <tr key={n.id}>
                            <td>
                              <span className="td-id">{n.id}</span>
                            </td>

                            <td>{n.sender}</td>

                            <td>{n.subject}</td>

                            <td>{n.datetime}</td>

                            <td>
                              <span
                                className={`badge ${
                                  n.priority === "High"
                                    ? "badge-high"
                                    : n.priority === "Medium"
                                      ? "badge-medium"
                                      : "badge-low"
                                }`}
                              >
                                {n.priority}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`badge ${
                                  n.status === "Unread"
                                    ? "badge-unread"
                                    : "badge-ack"
                                }`}
                              >
                                {n.status}
                              </span>
                            </td>

                            <td>
                              <div className="action-cluster">
                                <button
                                  className="btn-sm btn-sm-blue"
                                  onClick={() => setSelectedNotification(n)}
                                >
                                  View
                                </button>

                                <button
                                  className="btn-sm btn-sm-green"
                                  onClick={() => acknowledgeNotification(n.id)}
                                >
                                  Ack
                                </button>

                                <button
                                  className="btn-sm btn-sm-orange"
                                  onClick={() => {
                                    setSelectedNotification(n);
                                    setShowForwardModal(true);
                                  }}
                                >
                                  Forward
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pag-row">
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      Showing 5 records
                    </span>

                    <div className="pagination">
                      <button className="pg-btn">Previous</button>

                      <button className="pg-btn active">1</button>

                      <button className="pg-btn">2</button>

                      <button className="pg-btn">Next</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activePage === "tickets" && (
              <div className="page active">
                <div className="page-header">
                  <div>
                    <div className="page-title">
                      Tickets from External Users
                    </div>

                    <div className="page-sub">
                      Manage and respond to all incoming support tickets
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="search-row">
                    <div className="search-wrap">
                      <input
                        className="search-input"
                        placeholder="Search by ticket ID, issue, user..."
                      />
                    </div>

                    {/* Department filter removed */}

                    <select className="filter-select">
                      <option>All Statuses</option>
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Closed</option>
                    </select>

                    <select className="filter-select">
                      <option>All Priorities</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Ticket ID</th>

                          <th>External User</th>

                          <th>Issue Title</th>

                          {/* Department removed */}

                          <th>Priority</th>

                          <th>Status</th>

                          <th>Last Updated</th>

                          <th>Attach.</th>

                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {tickets.map((t) => (
                          <tr key={t.id}>
                            <td>
                              <span className="td-id">{t.id}</span>
                            </td>

                            <td>{t.user}</td>

                            <td>{t.issue}</td>

                            <td>
                              <span
                                className={`badge ${
                                  t.priority === "High"
                                    ? "badge-high"
                                    : t.priority === "Medium"
                                      ? "badge-medium"
                                      : "badge-low"
                                }`}
                              >
                                {t.priority}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`badge ${
                                  t.status === "Open"
                                    ? "badge-open"
                                    : t.status === "In Progress"
                                      ? "badge-process"
                                      : "badge-closed"
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>

                            <td>{t.updated}</td>

                            <td
                              style={{
                                textAlign: "center",
                              }}
                            >
                              {t.attach ? "📎" : "-"}
                            </td>

                            <td>
                              <div className="action-cluster">
                                <button
                                  className="btn-sm btn-sm-blue"
                                  onClick={() => setSelectedTicket(t)}
                                >
                                  View Ticket
                                </button>

                                <button className="btn-sm btn-sm-green">
                                  Continue
                                </button>

                                <button className="btn-sm btn-sm-orange">
                                  Reassign
                                </button>

                                {t.status !== "Closed" ? (
                                  <button className="btn-sm btn-sm-red">
                                    Close
                                  </button>
                                ) : (
                                  <button
                                    className="btn-sm"
                                    disabled
                                    style={{
                                      opacity: 0.5,
                                    }}
                                  >
                                    Closed
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pag-row">
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      Showing 5 records
                    </span>

                    <div className="pagination">
                      <button className="pg-btn">Previous</button>

                      <button className="pg-btn active">1</button>

                      <button className="pg-btn">2</button>

                      <button className="pg-btn">Next</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activePage === "activity" && (
              <div className="page active">
                <div className="page-header">
                  <div>
                    <div className="page-title">Activity History</div>

                    <div className="page-sub">
                      Full audit trail of all actions performed
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="activity-item">
                    <div>
                      <div className="act-text">
                        <strong>NTF-0031</strong> — Notification received from
                        Arjun Patel
                      </div>

                      <div className="act-time">15 Jun 2026 · 09:12 AM</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div>
                      <div className="act-text">
                        <strong>TKT-0092</strong> — Ticket opened by Meena
                        Krishnan
                      </div>

                      <div className="act-time">15 Jun 2026 · 08:47 AM</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div>
                      <div className="act-text">
                        <strong>NTF-0030</strong> — Acknowledged by Priya Sharma
                      </div>

                      <div className="act-time">14 Jun 2026 · 04:30 PM</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div>
                      <div className="act-text">
                        <strong>TKT-0091</strong> — Reassigned
                      </div>

                      <div className="act-time">14 Jun 2026 · 02:15 PM</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div>
                      <div className="act-text">
                        <strong>TKT-0089</strong> — Closed successfully
                      </div>

                      <div className="act-time">13 Jun 2026 · 10:22 AM</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* PROFILE */}
            {activePage === "profile" && (
              <div className="page active">
                <div className="page-header">
                  <div>
                    <div className="page-title">My Profile</div>

                    <div className="page-sub">
                      View and manage account information
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-avatar">PS</div>

                  <div style={{ flex: 1 }}>
                    <div className="profile-name">Priya Sharma</div>

                    <div className="profile-meta">
                      IT Support Department · Internal Staff
                    </div>

                    <div className="profile-meta" style={{ marginTop: "6px" }}>
                      p.sharma@dept.gov
                    </div>
                  </div>

                  <button className="btn btn-primary">Edit Profile</button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Account Details</span>
                    </div>

                    <div className="info-row">
                      <span className="info-key">Staff ID</span>

                      <span>STF-0024</span>
                    </div>

                    <div className="info-row">
                      <span className="info-key">Username</span>

                      <span>priya.sharma</span>
                    </div>

                    <div className="info-row">
                      <span className="info-key">Department</span>

                      <span>IT Support</span>
                    </div>

                    <div className="info-row">
                      <span className="info-key">Role</span>

                      <span>Internal Staff</span>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">My Stats</span>
                    </div>

                    <div className="info-row">
                      <span className="info-key">Notifications Received</span>

                      <span>5</span>
                    </div>

                    <div className="info-row">
                      <span className="info-key">Tickets Managed</span>

                      <span>5</span>
                    </div>

                    <div className="info-row">
                      <span className="info-key">Pending Actions</span>

                      <span>4</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {toast && (
              <div
                style={{
                  position: "fixed",
                  top: "20px",
                  right: "20px",
                  background: "#16a34a",
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  zIndex: 9999,
                  fontWeight: 600,
                }}
              >
                {toast}
              </div>
            )}
            {selectedTicket && (
              <div className="modal-overlay">
                <div className="modal notification-modal">
                  <div className="modal-header">
                    <h2>{selectedTicket.id} - Ticket Details</h2>

                    <button
                      className="modal-close"
                      onClick={() => setSelectedTicket(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="modal-content">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Ticket ID</label>
                        <span>{selectedTicket.id}</span>
                      </div>

                      <div className="detail-item">
                        <label>User</label>
                        <span>{selectedTicket.user}</span>
                      </div>

                      <div className="detail-item">
                        <label>Priority</label>
                        <span>{selectedTicket.priority}</span>
                      </div>

                      <div className="detail-item">
                        <label>Status</label>
                        <span>{selectedTicket.status}</span>
                      </div>
                    </div>

                    <div className="subject-box">
                      <label>Issue</label>
                      <div>{selectedTicket.issue}</div>
                    </div>

                    <div className="message-box">
                      <label>Ticket Timeline</label>

                      {ticketTimeline[selectedTicket.id]?.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            gap: "15px",
                            padding: "12px 0",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: "#2563eb",
                              marginTop: "6px",
                            }}
                          />

                          <div>
                            <strong>{item.time}</strong>

                            <div>{item.action}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn-close"
                      onClick={() => setSelectedTicket(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
            {selectedNotification && !showForwardModal && (
              <div className="modal-overlay">
                <div className="modal notification-modal">
                  <div className="modal-header">
                    <h2>{selectedNotification.id} — Notification Details</h2>

                    <button
                      className="modal-close"
                      onClick={() => setSelectedNotification(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="modal-content">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Notification ID</label>
                        <span>{selectedNotification.id}</span>
                      </div>

                      <div className="detail-item">
                        <label>Sender</label>
                        <span>{selectedNotification.sender}</span>
                      </div>

                      <div className="detail-item">
                        <label>Department</label>
                        <span>IT Support</span>
                      </div>

                      <div className="detail-item">
                        <label>Date & Time</label>
                        <span>{selectedNotification.datetime}</span>
                      </div>

                      <div className="detail-item">
                        <label>Priority</label>

                        <span className="priority-pill high">
                          {selectedNotification.priority}
                        </span>
                      </div>

                      <div className="detail-item">
                        <label>Status</label>

                        <span className="status-pill unread">
                          {selectedNotification.status}
                        </span>
                      </div>
                    </div>

                    <div className="subject-box">
                      <label>Subject</label>

                      <div>{selectedNotification.subject}</div>
                    </div>

                    <div className="message-box">
                      <label>Message Body</label>

                      <div>
                        Dear IT Support Team, I have been unable to log into the
                        internal portal since this morning. The system shows
                        "Authentication Failed" even with correct credentials.
                        This is blocking my work urgently. Please advise at the
                        earliest.
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn-close"
                      onClick={() => setSelectedNotification(null)}
                    >
                      Close
                    </button>

                    <button
                      className="btn-forward"
                      onClick={() => setShowForwardModal(true)}
                    >
                      Forward
                    </button>

                    <button
                      className="btn-ack"
                      onClick={() => {
                        acknowledgeNotification(selectedNotification.id);
                        setSelectedNotification(null);
                      }}
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showForwardModal && selectedNotification && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">Forward Notification</div>

                  <div className="modal-body">
                    <p>Forward notification:</p>

                    <strong>{selectedNotification.subject}</strong>

                    <br />
                    <br />

                    <select
                      style={{
                        width: "100%",
                        padding: "10px",
                      }}
                    >
                      <option>Finance Team</option>

                      <option>HR Team</option>

                      <option>Legal Team</option>
                    </select>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setToast("Notification forwarded");

                        setShowForwardModal(false);

                        setSelectedNotification(null);

                        setTimeout(() => {
                          setToast("");
                        }, 3000);
                      }}
                    >
                      Forward
                    </button>

                    <button
                      className="btn"
                      onClick={() => {
                        setShowForwardModal(false);
                        setSelectedNotification(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* content */}
        </div>
        {/* main */}
      </div>
      {/* app */}
    </div>
  );
}
