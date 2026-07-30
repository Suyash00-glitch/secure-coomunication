import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiJson } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

function PieChart({ data }) {
  const total = data.reduce((s, d) => s + Number(d.count), 0);
  if (total === 0) return <p style={{ fontSize: 13, color: "#6b7280" }}>No data</p>;

  const colors = {
  open: "#2563eb",
  closed: "#22c55e",
  unanswered: "#f59e0b",
  "being handled": "#94a3b8",

  acknowledged: "#22c55e",      
  unacknowledged: "#10b4c0",    

  "fully acknowledged": "#22c55e",
  "partially acknowledged": "#f59e0b"
};
  let cumulative = 0;

  const slices = data.map(d => {
    const pct = Number(d.count) / total;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start };
  });

  

  function describeArc(startPct, endPct) {
    const r = 65, cx = 100, cy = 100;
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
      justifyContent: "center",
      alignItems: "center",
      gap: 40,
      padding: "20px",
      width: "100%"
    }}
  >
      <svg
  viewBox="0 0 200 200"
  style={{
    width: 140,
    height: 140,
    flexShrink: 0
  }}
>
        {slices.map((s, i) => (
          <path key={i} d={describeArc(s.start, s.start + s.pct)}
            fill={colors[s.status_name?.toLowerCase()] || "#94a3b8"} />
        ))}
       <circle cx="100" cy="100" r="42" fill="white" />
      </svg>
     <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minWidth: 170
  }}
>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[s.status_name?.toLowerCase()] || "#94a3b8" }} />
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const { res, data } = await apiJson("/api/dashboard/stats");
        if (res.ok) setStats(data);

        const { res: activityRes, data: activityData } =
  await apiJson("/api/activity?limit=6");

if (activityRes.ok) {
  setActivities(activityData.activities);
}
      } catch (err) { console.log(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const displayName = user?.username || "User";
  const s = stats || {};

  if (loading) return (
    <div>
      <div className="page-header"><div><div className="page-title">Dashboard</div><div className="page-sub">Loading...</div></div></div>
    </div>
  );

  const total = (s.open || 0) + (s.underProcess || 0) + (s.closed || 0);
  const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);
   
  const cards = [
  {
    label: "Total Tickets",
    value: s.totalTickets ?? 0,
    icon: "ti-ticket",
    bg: "#dbeafe",
    color: "#2563eb",
    sub: "All tickets"
  },
  {
    label: "Open Tickets",
    value: s.open ?? 0,
    icon: "ti-folder-open",
    bg: "#dcfce7",
    color: "#16a34a",
    sub: "Awaiting response"
  },
  {
    label: "Being Handled",
    value: s.underProcess ?? 0,
    icon: "ti-loader",
    bg: "#fef3c7",
    color: "#ca8a04",
    sub: "Under process"
  },
  {
    label: "Closed",
    value: s.closed ?? 0,
    icon: "ti-circle-check",
    bg: "#ede9fe",
    color: "#7c3aed",
    sub: "Resolved"
  },
  {
    label: "Total Notifications",
    value: s.notifications ?? 0,
    icon: "ti-speakerphone",
    bg: "#cffafe",
    color: "#06b6d4",
    sub: "Notifications sent"
  },
  {
    label: "Acknowledged",
    value: s.acknowledgedNotifications ?? 0,
    icon: "ti-check",
    bg: "#dcfce7",
    color: "#22c55e",
    sub: "Fully acknowledged"
  },
  {
    label: "Partially Acknowledged",
    value: s.partiallyAcknowledgedNotifications ?? 0,
    icon: "ti-clock",
    bg: "#fef3c7",
    color: "#f59e0b",
    sub: "Some departments"
  },
  {
    label: "Unacknowledged",
    value: s.unacknowledgedNotifications ?? 0,
    icon: "ti-alert-circle",
    bg: "#fee2e2",
    color: "#ef4444",
    sub: "No department acknowledged"
  }
];







  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Welcome back, {displayName} — External User</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/external/tickets/create")}>
          <i className="ti ti-plus"></i> New Ticket
        </button>
      </div>

      <div className="stat-grid">
  {cards.map(card => (
    <div className="stat-card" key={card.label}>
      <div
        className="stat-icon"
        style={{
          background: card.bg,
          color: card.color
        }}
      >
        <i className={`ti ${card.icon}`}></i>
      </div>

      <div className="stat-label">{card.label}</div>

      <div
        className="stat-val"
        style={{ color: card.color }}
      >
        {card.value}
      </div>

      <div className="stat-sub">{card.sub}</div>
    </div>
  ))}
</div>

      <div className="qa-grid">
        <div className="qa-card" onClick={() => navigate("/external/tickets/create")}><i className="ti ti-plus qa-icon"></i><span>Create Ticket</span></div>
        <div className="qa-card" onClick={() => navigate("/external/tickets")}><i className="ti ti-list"></i><span>View My Tickets</span></div>
        <div className="qa-card" onClick={() => navigate("/external/notifications/create")}><i className="ti ti-speakerphone"></i><span>Send Notification</span></div>
        <div className="qa-card" onClick={() => navigate("/external/notifications")}><i className="ti ti-bell-ringing"></i><span>View Notifications</span></div>
      </div>

     <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginTop: 20
  }}
>

  <div className="card" style={{ minHeight: 220 }}>
    <div className="card-header">
      <span className="card-title">My Ticket Status</span>
    </div>

    <PieChart data={s.ticketsByStatus || []} />
  </div>

  <div className="card" style={{ minHeight: 220 }}>
    <div className="card-header">
      <span className="card-title">Notifications by Status</span>
    </div>

    <PieChart data={s.notifsByStatus || []} />
  </div>
</div>
 
 <div className="card" style={{ minHeight: 220 }}>
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