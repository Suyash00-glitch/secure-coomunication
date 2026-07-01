import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";

function fmtDate(d) {
  return new Date(d).toLocaleDateString();
}

/**
 * Notification List — fetches from GET /api/notifications.
 */
export default function NotificationList({ onNavigate, onOpenNotification }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const { res, data } = await apiJson("/api/notifications");
      if (res.ok) {
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={true ? "page active" : "page"} id="page-notif-list">
      <div className="page-header">
        <div><div className="page-title">Notification List</div><div className="page-sub">All outgoing notifications published by your department</div></div>
        <button className="btn btn-primary" id="button-40" onClick={() => onNavigate("create-notif")}><i className="ti ti-plus"></i> New Notification</button>
      </div>
      <div className="card">
        <div className="search-row">
          <div className="search-wrap"><i className="ti ti-search"></i><input className="search-input" id="text-41" placeholder="Search notifications…" type="text" /></div>
          <select className="filter-select" id="select-42" defaultValue="all_statuses">
            <option value="all_statuses">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <table>
          <thead><tr><th>Notif. ID</th><th>Title</th><th>Departments</th><th>Created By</th><th>Created Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody id="notification-body">
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>Loading notifications…</td></tr>
            ) : notifications.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>No notifications found</td></tr>
            ) : (
              notifications.map(n => (
                <tr key={n.notification_id}>
                  <td>NTF-{String(n.notification_id).padStart(4, "0")}</td>
                  <td>{n.title}</td>
                  <td>{n.departments}</td>
                  <td>{n.name}</td>
                  <td>{fmtDate(n.created_at)}</td>
                  <td><span className="badge badge-active"> Published </span></td>
                  <td><button className="action-btn" onClick={() => onOpenNotification(n.notification_id)}>View</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
