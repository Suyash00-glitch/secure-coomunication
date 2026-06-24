import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";

function fmtDate(d) {
  return new Date(d).toLocaleDateString();
}
function fmtDateTime(d) {
  return new Date(d).toLocaleString();
}

/**
 * Notification Detail — fetches from GET /api/notifications/:id.
 */
export default function NotificationDetail({ notificationId }) {
  const [notifDetail, setNotifDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!notificationId) return;
    async function load() {
      try {
        const { res, data } = await apiJson(`/api/notifications/${notificationId}`);
        if (res.ok) {
          setNotifDetail(data);
        }
      } catch (err) {
        console.error("Failed to load notification detail:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [notificationId]);

  if (loading) {
    return (
      <div className={true ? "page active" : "page"} id="page-notif-detail">
        <div className="page-header">
          <div><div className="page-title">Loading…</div></div>
        </div>
      </div>
    );
  }

  if (!notifDetail) {
    return (
      <div className={true ? "page active" : "page"} id="page-notif-detail">
        <div className="page-header">
          <div><div className="page-title">Notification not found</div></div>
        </div>
      </div>
    );
  }

  const nd = notifDetail;
  const departments = nd.departments || [];

  return (
    <div className={true ? "page active" : "page"} id="page-notif-detail">
      <div className="page-header">
        <div>
          <div className="page-title" id="notif-detail-title">
            {`Notification Detail — NTF-${String(nd.notification_id).padStart(4, "0")}`}
          </div>
          <div className="page-sub" id="notif-detail-date">
            {`Published on ${fmtDate(nd.created_at)}`}
          </div>
        </div>
        <span className="badge" id="notif-detail-status" style={{ fontSize: 13, padding: "6px 16px" }}>Published</span>
      </div>
      <div className="detail-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Notification Information</span></div>
          <div className="info-row"><span className="info-key">Notification ID</span><span id="notif-id">{`NTF-${String(nd.notification_id).padStart(4, "0")}`}</span></div>
          <div className="info-row"><span className="info-key">Title</span><span id="notif-title">{nd.title}</span></div>
          <div className="info-row"><span className="info-key">Created By</span><span id="notif-created-by">{nd.username}</span></div>
          <div className="info-row"><span className="info-key">Created Date</span><span id="notif-created-date">{fmtDateTime(nd.created_at)}</span></div>
          <div className="info-row"><span className="info-key">Status</span><span><span className="badge" id="notif-status">Published</span></span></div>
          <div className="info-row"><span className="info-key">Departments</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} id="notif-departments">
              {departments.map(d => <span className="badge badge-open" key={d}>{d}</span>)}
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Description</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151" }} id="notif-description">{nd.description}</p>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 500 }}>Attached Files</div>
            {/* TODO: Drive attachments from backend response */}
            <div className="file-chips">
              {nd.attachments && nd.attachments.length > 0 ? (
                nd.attachments.map((file, idx) => (
                  <div className="file-chip" key={idx}>
                    <i className={`ti ${file.icon || "ti-file"}`} style={{ color: file.color || "#374151" }}></i> {file.name}
                  </div>
                ))
              ) : (
                <span style={{ fontSize: 12, color: "#9ca3af" }}>No attachments</span>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Departments Included</span></div>
          <div id="notif-department-list">
            {departments.length > 0 ? (
              departments.map(d => (
                <div className="dept-icon-row" key={d}>
                  <div className="dept-icon-box"><i className="ti ti-building"></i></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{d}</div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: "#6b7280" }}>No departments listed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
