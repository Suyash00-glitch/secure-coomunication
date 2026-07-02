import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiJson } from "../../api/client";

function fmtDate(d) { return new Date(d).toLocaleDateString(); }
function fmtDateTime(d) { return new Date(d).toLocaleString(); }

export default function NotificationDetail() {
  const { id } = useParams();
  const [notifDetail, setNotifDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const { res, data } = await apiJson(`/api/notifications/${id}`);
        if (res.ok) setNotifDetail(data);
      } catch (err) { console.error("Failed to load notification detail:", err); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  if (loading) return <div><div className="page-header"><div><div className="page-title">Loading...</div></div></div></div>;
  if (!notifDetail) return <div><div className="page-header"><div><div className="page-title">Notification not found</div></div></div></div>;

  const nd = notifDetail;
  const departments = Array.isArray(nd.departments) ? nd.departments : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{`Notification Detail — NTF-${String(nd.notification_id).padStart(4, "0")}`}</div>
          <div className="page-sub">{`Published on ${fmtDate(nd.created_at)}`}</div>
        </div>
        <span className="badge" style={{ fontSize: 13, padding: "6px 16px" }}>Published</span>
      </div>
      <div className="detail-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Notification Information</span></div>
          <div className="info-row"><span className="info-key">Notification ID</span><span>{`NTF-${String(nd.notification_id).padStart(4, "0")}`}</span></div>
          <div className="info-row"><span className="info-key">Title</span><span>{nd.title}</span></div>
          <div className="info-row"><span className="info-key">Created By</span><span>{nd.username}</span></div>
          <div className="info-row"><span className="info-key">Created Date</span><span>{fmtDateTime(nd.created_at)}</span></div>
          <div className="info-row"><span className="info-key">Status</span><span><span className="badge">Published</span></span></div>
          <div className="info-row"><span className="info-key">Departments</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {departments.map(d => <span className="badge badge-open" key={d}>{d}</span>)}
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Description</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151" }}>{nd.description}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Departments Included</span></div>
          {departments.length > 0 ? (
            departments.map(d => (
              <div className="dept-icon-row" key={d}>
                <div className="dept-icon-box"><i className="ti ti-building"></i></div>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{d}</div></div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 13, color: "#6b7280" }}>No departments listed</p>
          )}
        </div>
      </div>
    </div>
  );
}
