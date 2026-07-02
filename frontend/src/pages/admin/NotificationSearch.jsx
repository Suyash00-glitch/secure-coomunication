import { useState } from "react";
import { apiJson } from "../../api/client";

function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : ""; }
function fmtDateTime(d) { return d ? new Date(d).toLocaleString() : ""; }

export default function NotificationSearch() {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    const q = searchId.trim();
    if (!q) return;
    try {
      const id = q.startsWith("NOT-") || q.startsWith("NTF-") ? q.split("-")[1] : q;
      const { res, data } = await apiJson(`/api/notifications/${Number(id)}`);
      if (res.ok) setResult(data);
      else setResult(null);
      setSearched(true);
    } catch (err) {
      console.log(err);
      setResult(null);
    }
  }

  function handleKeyDown(e) { if (e.key === "Enter") handleSearch(); }
  function handleReset() { setSearchId(""); setResult(null); setSearched(false); }

  if (result) {
    const notifId = result.notification_id ? `NTF-${String(result.notification_id).padStart(4, "0")}` : "";
    const departments = Array.isArray(result.departments) ? result.departments : [];
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">{`Notification Detail — ${notifId}`}</div>
            <div className="page-sub">{result.created_at ? `Published on ${fmtDate(result.created_at)}` : ""}</div>
          </div>
          <span className="badge" style={{ fontSize: 13, padding: "6px 16px" }}>Published</span>
        </div>
        <button className="btn btn-secondary" onClick={handleReset}>Back</button>
        <div className="detail-grid" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Notification Information</span></div>
            <div className="info-row"><span className="info-key">Notification ID</span><span>{notifId}</span></div>
            <div className="info-row"><span className="info-key">Title</span><span>{result.title}</span></div>
            <div className="info-row"><span className="info-key">Created By</span><span>{result.username}</span></div>
            <div className="info-row"><span className="info-key">Created Date</span><span>{fmtDateTime(result.created_at)}</span></div>
            <div className="info-row"><span className="info-key">Status</span><span><span className="badge">Published</span></span></div>
            {departments.length > 0 && (
              <div className="info-row"><span className="info-key">Departments</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {departments.map(d => <span className="badge badge-open" key={d}>{d}</span>)}
                </div>
              </div>
            )}
            {result.description && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Description</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151" }}>{result.description}</p>
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
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Notification Search</div>
          <div className="page-sub">Look up a notification by its ID</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="form-full">
          <label className="form-label">Notification ID</label>
          <input className="form-input" type="text" placeholder="Enter Notification ID" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyDown={handleKeyDown} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={handleSearch}><i className="ti ti-search"></i> Search</button>
          {searched && <button className="btn btn-secondary" onClick={handleReset}><i className="ti ti-arrow-back"></i> Back</button>}
        </div>
        {searched && !result && <div className="not-found"><i className="ti ti-alert-triangle"></i>Notification not found</div>}
      </div>
    </div>
  );
}
