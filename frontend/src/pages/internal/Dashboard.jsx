import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiJson } from "../../api/client";

export default function Dashboard() {
  const [notificationList, setNotificationList] = useState([]);
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    loadTickets();
  }, []);

  async function loadNotifications() {
    try {
      const { res, data } = await apiJson("/api/internal/notifications");
      if (res.ok) {
        setNotificationList(data.map(n => ({
          notification_id: n.notification_id,
          id: `NTF-${String(n.notification_id).padStart(4, "0")}`,
          sender: n.created_by,
          subject: n.title,
          datetime: new Date(n.created_at).toLocaleString(),
          description: n.description,
          priority: n.priority,
          status: n.is_acknowledged ? "Acknowledged" : "Unacknowledged"
        })));
      }
    } catch (err) { console.log(err); }
  }

  async function loadTickets() {
    try {
      const { res, data } = await apiJson("/api/internal/tickets");
      if (res.ok) {
        setTickets(data.map(t => ({
          ticket_id: t.ticket_id,
          id: `TKT-${String(t.ticket_id).padStart(4, "0")}`,
          user: t.created_by,
          issue: t.title,
          description: t.description,
          status: t.status_name,
          updated: new Date(t.created_at).toLocaleString(),
          acknowledged: t.acknowledgement_at !== null,
        })));
      }
    } catch (err) { console.log(err); }
  }

  const unread = notificationList.filter(n => n.status === "Unacknowledged").length;
  const acknowledged = notificationList.filter(n => n.status === "Acknowledged").length;
  const openTickets = tickets.filter(t => t.status !== "Closed").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Department overview — notifications and tickets</div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card" style={{ border: "2px solid #ef4444" }}>
          <div className="stat-top">
            <div>
              <div className="stat-label">UNREAD NOTIFICATIONS</div>
              <div className="stat-val" style={{ color: "#dc2626" }}>{unread}</div>
              <div className="stat-sub">Requires immediate attention</div>
            </div>
            <div className="stat-icon" style={{ background: "#fee2e2", color: "#dc2626" }}><i className="ti ti-bell"></i></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">TOTAL NOTIFICATIONS</div>
              <div className="stat-val" style={{ color: "#2563eb" }}>{notificationList.length}</div>
              <div className="stat-sub">Received this period</div>
            </div>
            <div className="stat-icon" style={{ background: "#dbeafe", color: "#2563eb" }}><i className="ti ti-mail"></i></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">ACKNOWLEDGED</div>
              <div className="stat-val" style={{ color: "#16a34a" }}>{acknowledged}</div>
              <div className="stat-sub">Notifications</div>
            </div>
            <div className="stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><i className="ti ti-circle-check"></i></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">OPEN TICKETS</div>
              <div className="stat-val" style={{ color: "#ca8a04" }}>{openTickets}</div>
              <div className="stat-sub">Awaiting action</div>
            </div>
            <div className="stat-icon" style={{ background: "#fef3c7", color: "#ca8a04" }}><i className="ti ti-ticket"></i></div>
          </div>
        </div>
      </div>
      <div className="qa-grid">
        <div className="qa-card" onClick={() => navigate("/internal/notifications")}><i className="ti ti-bell qa-icon"></i><span>View Notifications</span></div>
        <div className="qa-card" onClick={() => navigate("/internal/tickets")}><i className="ti ti-ticket qa-icon"></i><span>Manage Tickets</span></div>
        <div className="qa-card" onClick={() => navigate("/internal/activity")}><i className="ti ti-history qa-icon"></i><span>Activity History</span></div>
        <div className="qa-card" onClick={() => navigate("/internal/profile")}><i className="ti ti-user qa-icon"></i><span>My Profile</span></div>
      </div>
    </div>
  );
}
