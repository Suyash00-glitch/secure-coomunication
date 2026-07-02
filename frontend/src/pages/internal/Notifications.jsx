import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";
import NotificationModal from "./NotificationModal";
import ForwardModal from "./ForwardModal";

export default function Notifications() {
  const [notificationList, setNotificationList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { loadNotifications(); }, []);

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

  async function acknowledgeNotification(id) {
    try {
      const { res } = await apiJson(`/api/internal/notifications/${id}/acknowledge`, { method: "PATCH" });
      if (res.ok) {
        loadNotifications();
        setToast("Notification acknowledged");
        setTimeout(() => setToast(""), 3000);
      }
    } catch (err) { console.log(err); }
  }

  const filtered = notificationList.filter(n => {
    const matchSearch = search === "" || n.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || n.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Notifications Received</div>
          <div className="page-sub">Incoming notifications from external users</div>
        </div>
      </div>
      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <input className="search-input" placeholder="Search Notification ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Unacknowledged">Unacknowledged</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Notification ID</th><th>Sender</th><th>Subject</th><th>Date & Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(n => (
                <tr key={n.id}>
                  <td><span className="td-id">{n.id}</span></td>
                  <td>{n.sender}</td>
                  <td>{n.subject}</td>
                  <td>{n.datetime}</td>
                  <td><span className={`badge ${n.status === "Acknowledged" ? "badge-ack" : "badge-unread"}`}>{n.status}</span></td>
                  <td>
                    <div className="action-cluster">
                      <button className="btn-sm btn-sm-blue" onClick={() => setSelectedNotification(n)}>View</button>
                      {n.status === "Unacknowledged" && (
                        <button className="btn-sm btn-sm-green" onClick={() => acknowledgeNotification(n.notification_id)}>Acknowledge</button>
                      )}
                      <button className="btn-sm btn-sm-orange" onClick={() => { setSelectedNotification(n); setShowForwardModal(true); }}>Forward</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pag-row">
          <span style={{ fontSize: 12, color: "#6b7280" }}>Showing {filtered.length} records</span>
          <div className="pagination">
            <button className="pg-btn">Previous</button>
            <button className="pg-btn active">1</button>
            <button className="pg-btn">Next</button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">{toast}</div>
      )}

      <NotificationModal
        selectedNotification={selectedNotification}
        setSelectedNotification={setSelectedNotification}
        acknowledgeNotification={acknowledgeNotification}
        setShowForwardModal={setShowForwardModal}
      />
      <ForwardModal
        showForwardModal={showForwardModal}
        selectedNotification={selectedNotification}
        setShowForwardModal={setShowForwardModal}
        setSelectedNotification={setSelectedNotification}
        setToast={setToast}
      />
    </div>
  );
}
