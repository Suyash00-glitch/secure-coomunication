function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString() : "";
}
function fmtDateTime(d) {
  return d ? new Date(d).toLocaleString() : "";
}

export default function TicketDetail({ ticket , onBack}) {
  if (!ticket) return null;

  const ticketId = ticket.ticket_id ? `TKT-${String(ticket.ticket_id).padStart(4, "0")}` : "";

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{ticketId ? `Ticket Detail — ${ticketId}` : "Ticket Detail"}</div>
          <div className="page-sub">{ticket.created_at ? `Submitted on ${fmtDate(ticket.created_at)}` : ""}</div>
        </div>
      </div>



<button className="btn btn-secondary" onClick={onBack}>

<i className="ti ti-arrow-left"></i>

Back

</button>





      <div className="detail-grid">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">Ticket Information</span>
              {ticket.status_name && <span className="badge">{ticket.status_name}</span>}
            </div>
            <div className="info-row"><span className="info-key">Ticket ID</span><span>{ticketId}</span></div>
            <div className="info-row"><span className="info-key">Subject</span><span>{ticket.title}</span></div>
            <div className="info-row"><span className="info-key">Department</span><span>{ticket.department_name}</span></div>
            <div className="info-row"><span className="info-key">Created By</span><span>{ticket.username}</span></div>
            <div className="info-row"><span className="info-key">Created Date</span><span>{fmtDateTime(ticket.created_at)}</span></div>
            <div className="info-row"><span className="info-key">Last Updated</span><span>{fmtDateTime(ticket.updated_at)}</span></div>
            {ticket.description && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Description</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151" }}>{ticket.description}</p>
              </div>
            )}
          </div>
          {ticket.response && (
            <div className="card">
              <div className="card-header"><span className="card-title">Responses Received</span></div>
              <div className="response-box">
                <div className="response-header">
                  <span className="response-author">{ticket.response.author}</span>
                  <span className="response-time">{ticket.response.time}</span>
                </div>
                <p className="response-body">{ticket.response.body}</p>
              </div>
            </div>
          )}
        </div>
        {ticket.timeline && ticket.timeline.length > 0 && (
          <div className="card">
            <div className="card-header"><span className="card-title">Timeline / History</span></div>
            <div className="timeline">
              {ticket.timeline.map((item, idx) => (
                <div className="tl-item" key={idx}>
                  <div className="tl-dot" style={item.dotStyle || {}}></div>
                  <div className="tl-date">{item.date}</div>
                  <div className="tl-text">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



