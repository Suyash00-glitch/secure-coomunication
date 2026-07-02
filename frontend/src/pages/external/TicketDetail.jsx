import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiJson } from "../../api/client";

function fmtDate(d) { return new Date(d).toLocaleDateString(); }
function fmtDateTime(d) { return new Date(d).toLocaleString(); }

export default function TicketDetail() {
  const { id } = useParams();
  const [ticketDetail, setTicketDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const { res, data } = await apiJson(`/api/tickets/${id}`);
        if (res.ok) setTicketDetail(data);
      } catch (err) { console.log(err); alert("Unable to load ticket"); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  if (loading) return <div><div className="page-header"><div><div className="page-title">Loading...</div></div></div></div>;
  if (!ticketDetail) return <div><div className="page-header"><div><div className="page-title">Ticket not found</div></div></div></div>;

  const td = ticketDetail;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{td.ticket_id ? `Ticket Detail — TKT-${String(td.ticket_id).padStart(4, "0")}` : ""}</div>
          <div className="page-sub">{td.created_at ? `Submitted on ${fmtDate(td.created_at)}` : ""}</div>
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">Ticket Information</span>
              <span className="badge">{td.status_name}</span>
            </div>
            <div className="info-row"><span className="info-key">Ticket ID</span><span>{td.ticket_id ? `TKT-${String(td.ticket_id).padStart(4, "0")}` : ""}</span></div>
            <div className="info-row"><span className="info-key">Subject</span><span>{td.title}</span></div>
            <div className="info-row"><span className="info-key">Department</span><span>{td.department_name}</span></div>
            <div className="info-row"><span className="info-key">Created By</span><span>{td.username}</span></div>
            <div className="info-row"><span className="info-key">Created Date</span><span>{td.created_at ? fmtDateTime(td.created_at) : ""}</span></div>
            <div className="info-row"><span className="info-key">Last Updated</span><span>{td.updated_at ? fmtDateTime(td.updated_at) : ""}</span></div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Description</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151" }}>{td.description}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Responses Received</span></div>
            {td.responses && td.responses.length > 0 ? (
              td.responses.map((resp, idx) => (
                <div className="response-box" key={idx}>
                  <div className="response-header">
                    <span className="response-author">{resp.author}</span>
                    <span className="response-time">{resp.time}</span>
                  </div>
                  <p className="response-body">{resp.body}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: "#6b7280" }}>No responses yet</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Timeline / History</span></div>
          <div className="timeline">
            {td.timeline && td.timeline.length > 0 ? (
              td.timeline.map((item, idx) => (
                <div className="tl-item" key={idx}>
                  <div className="tl-dot" style={item.dotStyle ? { background: item.dotStyle.background } : {}}></div>
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
