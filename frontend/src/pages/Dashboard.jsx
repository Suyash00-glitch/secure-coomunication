export default function Dashboard({ stats }) {
  const cards = [
    { label: "Total Users",        value: stats.totalUsers,        icon: "ti-users",          bg: "#dbeafe", color: "#1d4ed8", sub: "Registered" },
    { label: "Total Departments",   value: stats.totalDepartments,  icon: "ti-building",       bg: "#dcfce7", color: "#166534", sub: "Configured" },
    { label: "Total Tickets",       value: stats.totalTickets,      icon: "ti-ticket",         bg: "#dbeafe", color: "#1d4ed8", sub: "All time" },
    { label: "Open Tickets",        value: stats.openTickets,       icon: "ti-folder-open",    bg: "#dcfce7", color: "#166534", sub: "Awaiting response" },
    { label: "Closed Tickets",      value: stats.closedTickets,     icon: "ti-circle-check",   bg: "#f3e8ff", color: "#6b21a8", sub: "Resolved" },
    { label: "Total Notifications", value: stats.totalNotifications, icon: "ti-speakerphone",  bg: "#ffe4e6", color: "#991b1b", sub: "Published" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Admin overview — system statistics at a glance</div>
        </div>
      </div>
      <div className="stat-grid">
        {cards.map(c => (
          <div className="stat-card" key={c.label}>
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
              <i className={`ti ${c.icon}`}></i>
            </div>
            <div className="stat-label">{c.label}</div>
            <div className="stat-val" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
