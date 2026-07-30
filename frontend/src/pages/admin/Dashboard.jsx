import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";

function PieChart({ data, colors = {} }) {
  const defaultColors = {
  open: "#2563eb",
  closed: "#22c55e",
  unanswered: "#f59e0b",
  "being handled": "#a6b80b",

  acknowledged: "#22c55e",      
  unacknowledged: "#10b4c0",    

  "fully acknowledged": "#22c55e",
  "partially acknowledged": "#f59e0b"
}; 
  const colorMap = { ...defaultColors, ...colors };

  const total = data.reduce((s, d) => s + Number(d.count), 0);
  if (total === 0) return <p style={{ fontSize: 13, color: "#6b7280" }}>No data</p>;

  let cumulative = 0;
  const slices = data.map(d => {
    const pct = Number(d.count) / total;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start };
  });

  function describeArc(startPct, endPct) {
    const r = 80, cx = 100, cy = 100;
    const startAngle = startPct * 2 * Math.PI - Math.PI / 2;
    const endAngle = endPct * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

return (
  <div
    style={{
      display: "flex",
      justifyContent: "center", alignItems: "center",gap: 40, padding: "20px",width: "100%",}}>
      <svg viewBox="0 0 200 200"style={{ width: 170,height: 170,flexShrink: 0}}>
        {slices.map((s, i) => (
          <path key={i} d={describeArc(s.start, s.start + s.pct)}
            fill={colorMap[s.status_name?.toLowerCase()] || "#94a3b8"} />
        ))}
        <circle cx="100" cy="100" r="50" fill="white" />
      </svg>
      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minWidth: 170,
  }}
>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: colorMap[s.status_name?.toLowerCase()] || "#94a3b8" }} />
            <span style={{ color: "#374151" }}>{s.status_name} ({s.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

  

export default function Dashboard() {
 const [stats, setStats] = useState(null);
const [activities, setActivities] = useState([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const { res, data } = await apiJson("/api/dashboard");
        if (res.ok) setStats(data);
        const { res: activityRes, data: activityData } =
  await apiJson("/api/activity?limit=6");

if (activityRes.ok) {
  setActivities(activityData.activities);
}
      } catch (err) { console.log(err); }
    }
    loadStats();
  }, []);

  const s = stats || {};

  const cards = [
    { label: "Total Users", value: s.totalUsers ?? 0, icon: "ti-users", bg: "#dbeafe", color: "#1d4ed8", sub: "Registered" },
    { label: "Total Departments", value: s.totalDepartments ?? 0, icon: "ti-building", bg: "#dcfce7", color: "#166534", sub: "Configured" },
    { label: "Total Tickets", value: s.totalTickets ?? 0, icon: "ti-ticket", bg: "#dbeafe", color: "#1d4ed8", sub: "All time" },
    { label: "Open Tickets", value: s.openTickets ?? 0, icon: "ti-folder-open", bg: "#dcfce7", color: "#166534", sub: "Awaiting response" },
    { label: "Being Handled", value: s.unansweredTickets ?? 0, icon: "ti-clock", bg: "#fef3c7", color: "#92400e", sub: "In progress" },
    { label: "Closed Tickets", value: s.closedTickets ?? 0, icon: "ti-circle-check", bg: "#f3e8ff", color: "#6b21a8", sub: "Resolved" },
    { label: "Total Notifications", value: s.totalNotifications ?? 0, icon: "ti-speakerphone", bg: "#ffe4e6", color: "#991b1b", sub: "Published" },
    {label: "Fully Acknowledged",value: s.fullyAcknowledgedNotifications ?? 0,icon: "ti-check",bg: "#dcfce7",color: "#16a34a",sub: "All departments"},
    {label: "Partially Acknowledged",value: s.partiallyAcknowledgedNotifications ?? 0,icon: "ti-clock",bg: "#fef3c7",color: "#d97706",sub: "Some departments"},
    {label: "Unacknowledged",value: s.unacknowledgedNotifications ?? 0,icon: "ti-alert-circle",bg: "#fee2e2",color: "#dc2626",sub: "Pending acknowledgement"}
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

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginTop: 20,
  }}
>
  <div className="card" style={{ minHeight: 250 }}>
    <div className="card-header">
      <span className="card-title">Tickets by Status</span>
    </div>

    <PieChart data={s.ticketsByStatus || []} />
  </div>

  <div className="card" style={{ minHeight: 250 }}>
    <div className="card-header">
      <span className="card-title">Notifications by Status</span>
    </div>

    <PieChart data={s.notifsByStatus || []} />
  </div>
</div>


<div
  className="card"
  style={{
    marginTop: 20,
    minHeight: 260
  }}
>
  <div className="card-header">
    <span className="card-title">Recent Activity</span>
  </div>

  {activities.length === 0 ? (
    <p style={{ color: "#6b7280" }}>No recent activity</p>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {activities.map((a) => (
        <div
          key={a.activity_id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: 8
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>
              {a.action}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#6b7280"
              }}
            >
              {a.item_type.toUpperCase()}-{a.item_id}
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#9ca3af"
            }}
          >
            {new Date(a.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )}
</div>


    </div>
  );
}