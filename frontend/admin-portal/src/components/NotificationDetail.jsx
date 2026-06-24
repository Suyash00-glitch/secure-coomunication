function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString() : "";
}
function fmtDateTime(d) {
  return d ? new Date(d).toLocaleString() : "";
}

export default function NotificationDetail({ notification , onBack }) {
  if (!notification) return null;

  const notifId = notification.notification_id
    ? `NTF-${String(notification.notification_id).padStart(4, "0")}`
    : "";

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{`Notification Detail — ${notifId}`}</div>
          <div className="page-sub">{notification.created_at ? `Published on ${fmtDate(notification.created_at)}` : ""}</div>
        </div>
        <span className="badge" style={{ fontSize: 13, padding: "6px 16px" }}>Published</span>
      </div>

<button className="btn btn-secondary" onClick={onBack}>

Back

</button>

      <div className="detail-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Notification Information</span></div>
          <div className="info-row"><span className="info-key">Notification ID</span><span>{notifId}</span></div>
          <div className="info-row"><span className="info-key">Title</span><span>{notification.title}</span></div>
          <div className="info-row"><span className="info-key">Created By</span><span>{notification.username}</span></div>
          <div className="info-row"><span className="info-key">Created Date</span><span>{fmtDateTime(notification.created_at)}</span></div>
          <div className="info-row"><span className="info-key">Status</span><span><span className="badge">Published</span></span></div>
          {notification.departments && notification.departments.length > 0 && (
            <div className="info-row">
              <span className="info-key">Departments</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {notification.departments.map(d => <span className="badge badge-open" key={d}>{d}</span>)}
              </div>
            </div>
          )}
          {notification.description && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Description</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151" }}>{notification.description}</p>
            </div>
          )}
        </div>
        {notification.departments && notification.departments.length > 0 && (
          <div className="card">
            <div className="card-header"><span className="card-title">Departments Included</span></div>
            {notification.departments.map(d => (
              <div className="dept-icon-row" key={d}>
                <div className="dept-icon-box"><i className="ti ti-building"></i></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
