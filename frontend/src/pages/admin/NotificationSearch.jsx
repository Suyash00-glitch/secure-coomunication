import { useState, useEffect, useMemo } from "react";
import { apiJson, downloadAttachment } from "../../api/client";

function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : ""; }
function fmtDateTime(d) { return d ? new Date(d).toLocaleString() : ""; }

function notifIdLabel(n) {
  return n?.notification_id ? `NTF-${String(n.notification_id).padStart(4, "0")}` : "";
}

// Fixed set — these three are the actual derived ack-summary labels the
// backend computes (see getAdminNotifications), not raw DB values, so
// unlike the ticket status filter these are safe to hardcode here.
const ACK_STATUS_OPTIONS = ["Unacknowledged", "Partially Acknowledged", "Fully Acknowledged"];

function ackBadgeClass(status) {
  if (status === "Fully Acknowledged") return "badge-ack";
  if (status === "Partially Acknowledged") return "badge-process";
  return "badge-unread";
}

export default function NotificationSearch() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  async function handleDownloadAttachment(file) {
    setDownloadError("");
    setDownloadingId(file.attachment_id);
    const result = await downloadAttachment(
      `/api/notifications/${detail.notification_id}/attachments/${file.attachment_id}/download`,
      file.file_name,
    );
    if (!result.ok) setDownloadError(result.message);
    setDownloadingId(null);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    setLoadError("");
    try {
      const { res, data } = await apiJson("/api/admin/notifications");
      if (res.ok) {
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setLoadError(data?.message || "Unable to load notifications.");
      }
    } catch (err) {
      console.log(err);
      setLoadError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications.filter((n) => {
      const matchesStatus =
        statusFilter === "all" || n.acknowledgement_status === statusFilter;

      if (!matchesStatus) return false;
      if (!q) return true;

      const id = notifIdLabel(n).toLowerCase();
      const sender = (n.created_by || "").toLowerCase();
      const title = (n.title || "").toLowerCase();
      const depts = Array.isArray(n.departments) ? n.departments.join(" ").toLowerCase() : "";

      return (
        id.includes(q) ||
        sender.includes(q) ||
        title.includes(q) ||
        depts.includes(q)
      );
    });
  }, [notifications, search, statusFilter]);

  async function openNotification(notificationId) {
    setSelectedNotificationId(notificationId);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const { res, data } = await apiJson(`/api/notifications/${notificationId}`);
      if (res.ok) {
        setDetail(data);
      } else {
        setDetailError(data?.message || "Notification not found.");
      }
    } catch (err) {
      console.log(err);
      setDetailError("Unable to connect to server.");
    } finally {
      setDetailLoading(false);
    }
  }

  function backToList() {
    setSelectedNotificationId(null);
    setDetail(null);
    setDetailError("");
  }

  // ── Detail view ──────────────────────────────────────────────
  if (selectedNotificationId) {
    const departments = Array.isArray(detail?.departments) ? detail.departments : [];

    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">
              {detail ? `Notification Detail — ${notifIdLabel(detail)}` : "Notification Detail"}
            </div>
            <div className="page-sub">
              {detail?.created_at ? `Published on ${fmtDate(detail.created_at)}` : ""}
            </div>
          </div>
          {detail && (
            <span className="badge" style={{ fontSize: 13, padding: "6px 16px" }}>Published</span>
          )}
        </div>
        <button className="btn btn-secondary" onClick={backToList}>
          <i className="ti ti-arrow-left"></i> Back to Notifications
        </button>

        {detailLoading && (
          <div className="card" style={{ marginTop: 16, textAlign: "center", padding: 40, color: "#6b7280" }}>
            Loading notification...
          </div>
        )}

        {!detailLoading && detailError && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="not-found"><i className="ti ti-alert-triangle"></i>{detailError}</div>
          </div>
        )}

        {!detailLoading && detail && (
          <div className="detail-grid" style={{ marginTop: 16 }}>
            <div className="card">
              <div className="card-header"><span className="card-title">Notification Information</span></div>
              <div className="info-row"><span className="info-key">Notification ID</span><span>{notifIdLabel(detail)}</span></div>
              <div className="info-row"><span className="info-key">Title</span><span>{detail.title}</span></div>
              <div className="info-row"><span className="info-key">Created By</span><span>{detail.username}</span></div>
              <div className="info-row"><span className="info-key">Created Date</span><span>{fmtDateTime(detail.created_at)}</span></div>
              <div className="info-row"><span className="info-key">Status</span><span><span className="badge">Published</span></span></div>
              {departments.length > 0 && (
                <div className="info-row"><span className="info-key">Departments</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {departments.map(d => <span className="badge badge-open" key={d}>{d}</span>)}
                  </div>
                </div>
              )}

              {detail.acknowledged_departments?.length > 0 && (
                <div className="info-row">
                  <span className="info-key">Acknowledged By</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {detail.acknowledged_departments.map(d => (
                      <span className="badge badge-process" key={d}>{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {detail.description && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Description</div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151" }}>{detail.description}</p>
                </div>
              )}

              {detail.attachments?.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, fontWeight: 500 }}>
                    Attachments
                  </div>
                  {downloadError && (
                    <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>{downloadError}</div>
                  )}
                  {detail.attachments.map(file => (
                    <div
                      key={file.attachment_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                        padding: "10px 14px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        background: "#f9fafb"
                      }}
                    >
                      <i className="ti ti-paperclip"></i>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, color: "#111827" }}>{file.file_name}</div>
                        {file.file_type && <div style={{ fontSize: 11, color: "#9ca3af" }}>{file.file_type}</div>}
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleDownloadAttachment(file)}
                        disabled={downloadingId === file.attachment_id}
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <i className="ti ti-download"></i>
                        {downloadingId === file.attachment_id ? "Downloading..." : "Download"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {departments.length > 0 && (
              <div className="card">
                <div className="card-header"><span className="card-title">Departments Included</span></div>
                {departments.map(d => (
                  <div className="dept-icon-row" key={d}>
                    <div className="dept-icon-box"><i className="ti ti-building"></i></div>
                    <div><div style={{ fontSize: 13, fontWeight: 500 }}>{d}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Notification Search</div>
          <div className="page-sub">Search and view all notifications</div>
        </div>
      </div>
      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <input
              className="search-input"
              placeholder="Search by notification ID, sender, subject, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {ACK_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Notification ID</th>
                <th>Sender</th>
                <th>Subject</th>
                <th>Department(s)</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                    Loading notifications...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#dc2626" }}>
                    {loadError}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                    No notifications found.
                  </td>
                </tr>
              ) : (
                filtered.map((n) => (
                  <tr key={n.notification_id}>
                    <td><span className="td-id">{notifIdLabel(n)}</span></td>
                    <td>{n.created_by || "—"}</td>
                    <td>{n.title}</td>
                    <td>
                      {Array.isArray(n.departments) && n.departments.length > 0
                        ? n.departments.join(", ")
                        : "—"}
                    </td>
                    <td>{fmtDateTime(n.created_at)}</td>
                    <td>
                      <span className={`badge ${ackBadgeClass(n.acknowledgement_status)}`}>
                        {n.acknowledgement_status}
                      </span>
                    </td>
                    <td>
                      <div className="action-cluster">
                        <button className="btn-sm btn-sm-blue" onClick={() => openNotification(n.notification_id)}>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pag-row">
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {loading ? "Loading..." : `Showing ${filtered.length} of ${notifications.length} records`}
          </span>
          <div className="pagination">
            <button className="pg-btn">Previous</button>
            <button className="pg-btn active">1</button>
            <button className="pg-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
