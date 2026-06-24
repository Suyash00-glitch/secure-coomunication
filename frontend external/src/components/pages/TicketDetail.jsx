import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";

function fmtDate(d) {
  return new Date(d).toLocaleDateString();
}
function fmtDateTime(d) {
  return new Date(d).toLocaleString();
}

/**
 * Ticket Detail — fetches from GET /api/tickets/:id.
 * Responses, timeline, and attachments are driven by backend data.
 */
export default function TicketDetail({ ticketId, onNavigate }) {
  const [ticketDetail, setTicketDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;
    async function load() {
      try {
        const { res, data } = await apiJson(`/api/tickets/${ticketId}`);
        if (res.ok) {
          setTicketDetail(data);
        }
      } catch (err) {
        console.log(err);
        alert("Unable to load ticket");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ticketId]);

  if (loading) {
    return (
      <div className={true ? "page active" : "page"} id="page-ticket-detail">
        <div className="page-header">
          <div><div className="page-title">Loading…</div></div>
        </div>
      </div>
    );
  }

  if (!ticketDetail) {
    return (
      <div className={true ? "page active" : "page"} id="page-ticket-detail">
        <div className="page-header">
          <div><div className="page-title">Ticket not found</div></div>
        </div>
      </div>
    );
  }

  const td = ticketDetail;

  return (
    <div className={true ? "page active" : "page"} id="page-ticket-detail">
      <div className="page-header">
        <div>
          <div className="page-title" id="detail-ticket-title">
            {td.ticket_id ? `Ticket Detail — TKT-${String(td.ticket_id).padStart(4, "0")}` : ""}
          </div>
          <div className="page-sub" id="detail-submitted">
            {td.created_at ? `Submitted on ${fmtDate(td.created_at)}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" id="button-27"><i className="ti ti-message-plus"></i> Continue Ticket</button>
          <button className="btn btn-danger" id="button-28"><i className="ti ti-x"></i> Close Ticket</button>
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">Ticket Information</span>
              <span className="badge" id="detail-status">{td.status_name}</span>
            </div>
            <div className="info-row"><span className="info-key">Ticket ID</span><span id="detail-ticket-id">{td.ticket_id ? `TKT-${String(td.ticket_id).padStart(4, "0")}` : " "}</span></div>
            <div className="info-row"><span className="info-key">Subject</span><span id="detail-subject">{td.title}</span></div>
            <div className="info-row"><span className="info-key">Department</span><span id="detail-department">{td.department_name}</span></div>
            <div className="info-row"><span className="info-key">Created By</span><span id="detail-created-by">{td.username}</span></div>
            <div className="info-row"><span className="info-key">Created Date</span><span id="detail-created-date">{td.created_at ? fmtDateTime(td.created_at) : ""}</span></div>
            <div className="info-row"><span className="info-key">Last Updated</span><span id="detail-updated-date">{td.updated_at ? fmtDateTime(td.updated_at) : ""}</span></div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Description</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151" }} id="detail-description">{td.description}</p>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 500 }}>Attachments</div>
              {/* TODO: Drive attachments from backend response */}
              <div className="file-chips">
                {td.attachments && td.attachments.length > 0 ? (
                  td.attachments.map((file, idx) => (
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
            <div className="card-header"><span className="card-title">Responses Received</span></div>
            {/* TODO: Drive responses from backend — expected shape: td.responses[] */}
            {td.responses && td.responses.length > 0 ? (
              td.responses.map((resp, idx) => (
                <div className="response-box" key={idx}>
                  <div className="response-header">
                    <span className="response-author" id="detail-response-author">{resp.author}</span>
                    <span className="response-time" id="detail-response-time">{resp.time}</span>
                  </div>
                  <p className="response-body" id="detail-response">{resp.body}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: "#6b7280" }}>No responses yet</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Timeline / History</span></div>
          <div className="timeline" id="timeline-container">
            {/* TODO: Drive timeline from backend — expected shape: td.timeline[] */}
            {td.timeline && td.timeline.length > 0 ? (
              td.timeline.map((item, idx) => (
                <div className="tl-item" key={idx}>
                  <div className="tl-dot" style={item.dotStyle ? { background: item.dotStyle.background, boxShadow: `0 0 0 2px ${item.dotStyle.background}` } : {}}></div>
                  <div className="tl-date">{item.date}</div>
                  <div className="tl-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: "#6b7280" }}>No timeline events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
