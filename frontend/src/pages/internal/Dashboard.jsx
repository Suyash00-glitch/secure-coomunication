import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiJson } from "../../api/client";

function PieChart({ data }) {
  const total = data.reduce((s, d) => s + Number(d.count), 0);
  if (total === 0) return <p style={{ fontSize: 13, color: "#6b7280" }}>No data</p>;

    const colors = {
  open: "#2563eb",
  closed: "#22c55e",
  unanswered: "#f59e0b",
  "being handled": "#a6b80b",

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
  <div style={{display: "flex",justifyContent: "center",alignItems: "center",gap: 40,padding: "20px",}}>

   <svg viewBox="0 0 200 200" style={{width: 170,height: 170,flexShrink: 0,}}>

      {slices.length === 1 ? (
        <circle
          cx="100"
          cy="100"
          r="80"
          fill={colors[slices[0].status_name.toLowerCase()] || "#94a3b8"}
        />
      ) : (
        slices.map((s, i) => (
          <path
            key={i}
            d={describeArc(s.start, s.start + s.pct)}
            fill={colors[s.status_name.toLowerCase()] || "#94a3b8"}
          />
        ))
      )}

      <circle
        cx="100"
        cy="100"
        r="50"
        fill="white"
      />
    </svg>

    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {slices.map((s, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: colors[s.status_name.toLowerCase()] || "#94a3b8"
            }}
          />
          <span>{s.status_name} ({s.count})</span>
        </div>
      ))}
    </div>

  </div>
);
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const { res, data } = await apiJson("/api/dashboard/internal");
        if (res.ok) setStats(data);
        const { res: activityRes, data: activityData } =
  await apiJson("/api/activity?limit=6");

if (activityRes.ok) {
  setActivities(activityData.activities);
}
      } catch (err) { console.log(err); }
    }
    load();
  }, []);

  const s = stats || {};


  const cards = [
  {
    label: "Total Tickets",
    value: s.totalTickets ?? 0,
    icon: "ti-ticket",
    bg: "#dbeafe",
    color: "#2563eb",
    sub: "Department tickets"
  },
  {
    label: "Open Tickets",
    value: s.openTickets ?? 0,
    icon: "ti-folder-open",
    bg: "#fef3c7",
    color: "#f59e0b",
    sub: "Awaiting action"
  },
  {
    label: "Being Handled",
    value: s.beingHandledTickets ?? 0,
    icon: "ti-loader",
    bg: "#ede9fe",
    color: "#7c3aed",
    sub: "Assigned tickets"
  },
  {
    label: "Total Notifications",
    value: s.totalNotifications ?? 0,
    icon: "ti-mail",
    bg: "#cffafe",
    color: "#06b6d4",
    sub: "Department notifications"
  },
  {
    label: "Acknowledged",
    value: s.acknowledgedNotifications ?? 0,
    icon: "ti-circle-check",
    bg: "#dcfce7",
    color: "#22c55e",
    sub: "Acknowledged notifications"
  },
  {
    label: "Unacknowledged",
    value: s.unreadNotifications ?? 0,
    icon: "ti-alert-circle",
    bg: "#fee2e2",
    color: "#ef4444",
    sub: "Pending acknowledgement"
  }
];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Department overview — notifications and tickets</div>
        </div>
      </div>

     <div className="stat-grid">
  {cards.map(card => (
    <div className="stat-card" key={card.label}>
      <div className="stat-top">
        <div>
          <div className="stat-label">{card.label.toUpperCase()}</div>

          <div
            className="stat-val"
            style={{ color: card.color }}
          >
            {card.value}
          </div>

          <div className="stat-sub">
            {card.sub}
          </div>
        </div>

        <div
          className="stat-icon"
          style={{
            background: card.bg,
            color: card.color
          }}
        >
          <i className={`ti ${card.icon}`}></i>
        </div>
      </div>
    </div>
  ))}
</div>

      <div className="qa-grid">
        <div className="qa-card" onClick={() => navigate("/internal/notifications")}><i className="ti ti-bell qa-icon"></i><span>View Notifications</span></div>
        <div className="qa-card" onClick={() => navigate("/internal/tickets")}><i className="ti ti-ticket qa-icon"></i><span>Manage Tickets</span></div>
        <div className="qa-card" onClick={() => navigate("/internal/activity")}><i className="ti ti-history qa-icon"></i><span>Activity History</span></div>
        <div className="qa-card" onClick={() => navigate("/internal/profile")}><i className="ti ti-user qa-icon"></i><span>My Profile</span></div>
      </div>

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginTop: 20,
  }}
>
  
  <div className="card">
    <div className="card-header">
      <span className="card-title">Tickets by Status</span>
    </div>

    <PieChart data={s.ticketsByStatus || []} />
  </div>

  <div className="card">
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
            alignItems: "center",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: 10
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