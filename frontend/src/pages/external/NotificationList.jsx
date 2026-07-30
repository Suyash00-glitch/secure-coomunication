import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiJson } from "../../api/client";

import { fmtDate, fmtDateTime } from "../../data/date";


function ackBadgeClass(status) {
    if (status === "Fully Acknowledged") return "badge-ack";
    if (status === "Partially Acknowledged") return "badge-process";
    return "badge-unread";
}


export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [page, setPage] = useState(1);
const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
  setPage(1);
}, [search, statusFilter]);

  async function loadNotifications() {
    setLoading(true);
    try {
      const { res, data } = await apiJson("/api/notifications");
      if (res.ok) setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = notifications.filter((n) => {
    const notifId = `NTF-${String(n.notification_id).padStart(4, "0")}`;
    const matchSearch =
      search === "" ||
      notifId.toLowerCase().includes(search.toLowerCase()) ||
      (n.title && n.title.toLowerCase().includes(search.toLowerCase()));
    const matchStatus =
  statusFilter === "all_statuses" ||
  n.acknowledgement_status === statusFilter;

      
  return matchSearch && matchStatus;

  });


  const totalPages = Math.ceil(filtered.length / pageSize);

const paginatedNotifications = filtered.slice(
  (page - 1) * pageSize,
  page * pageSize
);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Notification List</div>
          <div className="page-sub">
            All outgoing notifications published by your department
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/external/notifications/create")}
        >
          <i className="ti ti-plus"></i> New Notification
        </button>
      </div>
      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <i className="ti ti-search"></i>
            <input
              className="search-input"
              placeholder="Search notifications..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
         <option value="all_statuses">All Statuses</option>
<option value="Unacknowledged">Unacknowledged</option>
<option value="Partially Acknowledged">Partially Acknowledged</option>
<option value="Fully Acknowledged">Fully Acknowledged</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Notif. ID</th>
              <th>Title</th>
              <th>Departments</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: 24, color: "#6b7280" }}
                >
                  Loading notifications...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: 24, color: "#6b7280" }}
                >
                  No notifications found
                </td>
              </tr>
            ) : (
            paginatedNotifications.map((n) => (
                <tr key={n.notification_id}>
                  <td>NTF-{String(n.notification_id).padStart(4, "0")}</td>
                  <td>{n.title}</td>
                  <td>{n.departments}</td>
                  <td>{n.username}</td>
                  <td>{fmtDate(n.created_at)}</td>
                  <td>
              <span className={`badge ${ackBadgeClass(n.acknowledgement_status)}`}>
    {n.acknowledgement_status}
</span>
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() =>
                        navigate(`/external/notifications/${n.notification_id}`)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

<div className="pag-row">
  <span style={{ fontSize: 12, color: "#6b7280" }}>
    {`Showing ${paginatedNotifications.length} of ${filtered.length} records`}
  </span>

  <div className="pagination">
    <button
      className="pg-btn"
      disabled={page === 1}
      onClick={() => setPage(page - 1)}
    >
      Previous
    </button>

    <button className="pg-btn active">
      {page}
    </button>

    <button
      className="pg-btn"
      disabled={page === totalPages || totalPages === 0}
      onClick={() => setPage(page + 1)}
    >
      Next
    </button>
  </div>
</div>


      </div>
    </div>
  );
}
