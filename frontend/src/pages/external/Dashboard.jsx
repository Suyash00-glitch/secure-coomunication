import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiJson } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const { res, data } = await apiJson("/api/dashboard/stats");
        if (res.ok) setStats(data);
      } catch (err) { console.error("Failed to load dashboard stats:", err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const displayName = user?.username || "User";

  if (loading) {
    return (
      <div>
        <div className="page-header"><div><div className="page-title">Dashboard</div><div className="page-sub">Loading...</div></div></div>
        <div className="stat-grid">{[...Array(5)].map((_, i) => <div className="stat-card" key={i} style={{ opacity: 0.5 }}><div className="stat-label">Loading...</div><div className="stat-val">--</div></div>)}</div>
      </div>
    );
  }

  const s = stats || {};

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
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe", color: "#1d4ed8" }}><i className="ti ti-ticket"></i></div>
          <div className="stat-label">Total Tickets</div>
          <div className="stat-val" style={{ color: "#1d4ed8" }}>{s.totalTickets ?? 0}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7", color: "#166534" }}><i className="ti ti-folder-open"></i></div>
          <div className="stat-label">Open</div>
          <div className="stat-val" style={{ color: "#166534" }}>{s.open ?? 0}</div>
          <div className="stat-sub">Awaiting response</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#92400e" }}><i className="ti ti-clock"></i></div>
          <div className="stat-label">Under Process</div>
          <div className="stat-val" style={{ color: "#92400e" }}>{s.underProcess ?? 0}</div>
          <div className="stat-sub">Being handled</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f3e8ff", color: "#6b21a8" }}><i className="ti ti-circle-check"></i></div>
          <div className="stat-label">Closed</div>
          <div className="stat-val" style={{ color: "#6b21a8" }}>{s.closed ?? 0}</div>
          <div className="stat-sub">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ffe4e6", color: "#991b1b" }}><i className="ti ti-speakerphone"></i></div>
          <div className="stat-label">Notifications</div>
          <div className="stat-val" style={{ color: "#991b1b" }}>{s.notifications ?? 0}</div>
          <div className="stat-sub">Total sent</div>
        </div>
      </div>
      <div className="qa-grid">
        <div className="qa-card" onClick={() => navigate("/external/tickets/create")}><i className="ti ti-plus-square"></i><span>Create Ticket</span></div>
        <div className="qa-card" onClick={() => navigate("/external/tickets")}><i className="ti ti-list"></i><span>View My Tickets</span></div>
        <div className="qa-card" onClick={() => navigate("/external/notifications/create")}><i className="ti ti-speakerphone"></i><span>Send Notification</span></div>
        <div className="qa-card" onClick={() => navigate("/external/notifications")}><i className="ti ti-bell-ringing"></i><span>View Notifications</span></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Last 7 days</span>
          </div>
          {s.recentActivity && s.recentActivity.length > 0 ? (
            s.recentActivity.map((item, idx) => (
              <div className="activity-item" key={idx}>
                <div className="act-icon"><i className={`ti ${item.icon || "ti-ticket"}`}></i></div>
                <div>
                  <div className="act-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                  <div className="act-time">{item.time}</div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 13, color: "#6b7280", padding: "12px 0" }}>No recent activity</p>
          )}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Ticket Status Summary</span></div>
          <div style={{ padding: "6px 0" }}>
            {(() => {
              const total = (s.open || 0) + (s.underProcess || 0) + (s.closed || 0);
              const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);
              return (
                <>
                  <div className="progress-row"><span className="progress-label">Open</span><div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${pct(s.open || 0)}%`, background: "#1a73e8" }}></div></div><span className="progress-count">{s.open ?? 0}</span></div>
                  <div className="progress-row"><span className="progress-label">Under Process</span><div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${pct(s.underProcess || 0)}%`, background: "#f59e0b" }}></div></div><span className="progress-count">{s.underProcess ?? 0}</span></div>
                  <div className="progress-row"><span className="progress-label">Closed</span><div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${pct(s.closed || 0)}%`, background: "#22c55e" }}></div></div><span className="progress-count">{s.closed ?? 0}</span></div>
                </>
              );
            })()}
            <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 14, paddingTop: 14 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>By Priority</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-high">High: {s.priorityHigh ?? 0}</span>
                <span className="badge badge-medium">Medium: {s.priorityMedium ?? 0}</span>
                <span className="badge badge-low">Low: {s.priorityLow ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
