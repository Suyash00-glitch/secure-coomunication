import { useState } from "react";
import { apiJson } from "../../api/client";

function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : ""; }
function fmtDateTime(d) { return d ? new Date(d).toLocaleString() : ""; }

export default function TicketSearch() {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    const q = searchId.trim();
    if (!q) return;
    try {
      const id = q.startsWith("TKT-") ? q.split("-")[1] : q;
      const { res, data } = await apiJson(`/api/tickets/${Number(id)}`);
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
    const ticketId = result.ticket_id ? `TKT-${String(result.ticket_id).padStart(4, "0")}` : "";
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">{ticketId ? `Ticket Detail — ${ticketId}` : "Ticket Detail"}</div>
            <div className="page-sub">{result.created_at ? `Submitted on ${fmtDate(result.created_at)}` : ""}</div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleReset}><i className="ti ti-arrow-left"></i> Back</button>
        <div className="detail-grid" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Ticket Information</span>
              {result.status_name && <span className="badge">{result.status_name}</span>}
            </div>
            <div className="info-row"><span className="info-key">Ticket ID</span><span>{ticketId}</span></div>
            <div className="info-row"><span className="info-key">Subject</span><span>{result.title}</span></div>
            <div className="info-row"><span className="info-key">Department</span><span>{result.department_name}</span></div>
            <div className="info-row"><span className="info-key">Created By</span><span>{result.username}</span></div>
            <div className="info-row"><span className="info-key">Created Date</span><span>{fmtDateTime(result.created_at)}</span></div>
            <div className="info-row"><span className="info-key">Last Updated</span><span>{fmtDateTime(result.updated_at)}</span></div>
            {result.description && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Description</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151" }}>{result.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Ticket Search</div>
          <div className="page-sub">Look up a ticket by its ID</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="form-full">
          <label className="form-label">Ticket ID</label>
          <input className="form-input" type="text" placeholder="Enter Ticket ID" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyDown={handleKeyDown} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={handleSearch}><i className="ti ti-search"></i> Search</button>
          {searched && <button className="btn btn-secondary" onClick={handleReset}><i className="ti ti-arrow-back"></i> Back</button>}
        </div>
        {searched && !result && <div className="not-found"><i className="ti ti-alert-triangle"></i>Ticket not found</div>}
      </div>
    </div>
  );
}
