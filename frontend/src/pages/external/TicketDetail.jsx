import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiJson, downloadAttachment } from "../../api/client";
import { getSocket } from "../../socket";

function fmtDate(d) { return new Date(d).toLocaleDateString(); }
function fmtDateTime(d) { return new Date(d).toLocaleString(); }

export default function TicketDetail() {
  const { id } = useParams();
  const [ticketDetail, setTicketDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [expectedResponses, setExpectedResponses] = useState([""]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false); 

  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  async function handleDownloadAttachment(file) {
    setDownloadError("");
    setDownloadingId(file.attachment_id);
    const result = await downloadAttachment(
      `/api/tickets/${ticketDetail.ticket_id}/attachments/${file.attachment_id}/download`,
      file.file_name,
    );
    if (!result.ok) setDownloadError(result.message);
    setDownloadingId(null);
  }

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
    const socket = getSocket();
    if (socket) {
      socket.emit("join-ticket", id);
      const handler = () => { load(); };
      socket.on("ticket-conversation-updated", handler);
      socket.on("ticket-closed", handler); 
      return () => {
        socket.off("ticket-conversation-updated", handler);
        socket.off("ticket-closed", handler);
      };
    }
  }, [id]);

  function addResponseField() { setExpectedResponses([...expectedResponses, ""]); }
  function removeResponseField(index) { setExpectedResponses(expectedResponses.filter((_, i) => i !== index)); }
  function updateResponse(index, value) {
    const copy = [...expectedResponses];
    copy[index] = value;
    setExpectedResponses(copy);
  }

  async function sendReply() {
    const responses = expectedResponses.filter(r => r.trim() !== "");
    if (!replyMessage.trim()) { alert("Message required"); return; }
    if (responses.length === 0) { alert("At least one response option required"); return; }
    try {
      const { res } = await apiJson(`/api/tickets/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage, expectedResponses: responses })
      });
      if (res.ok) {
        setReplyMessage("");
        setExpectedResponses([""]);
        const { res: newRes, data } = await apiJson(`/api/tickets/${id}`);
        if (newRes.ok) setTicketDetail(data);
      }
    } catch(err) { console.log(err); }
  }

  async function closeTicket() {
    try {
      const { res } = await apiJson(`/api/tickets/${id}/close`, { method: "PATCH" });
      if (res.ok) {
        setShowCloseConfirm(false);
        const { res: newRes, data } = await apiJson(`/api/tickets/${id}`);
        if (newRes.ok) setTicketDetail(data);
      }
    } catch(err) { console.log(err); }
  }

  if (loading) return <div><div className="page-header"><div><div className="page-title">Loading...</div></div></div></div>;
  if (!ticketDetail) return <div><div className="page-header"><div><div className="page-title">Ticket not found</div></div></div></div>;

  const td = ticketDetail;
  const isClosed = td.status_name?.toLowerCase() === "closed";

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{td.ticket_id ? `Ticket Detail — TKT-${String(td.ticket_id).padStart(4, "0")}` : ""}</div>
          <div className="page-sub">{td.created_at ? `Submitted on ${fmtDate(td.created_at)}` : ""}</div>
        </div>
        {}
        {!isClosed && (
          <button
            className="btn btn-danger"
            onClick={() => setShowCloseConfirm(true)}
            style={{ marginLeft: "auto" }}
          >
            Close Ticket
          </button>
        )}
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

            {td.attachments?.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, fontWeight: 500 }}>Attachments</div>
                {downloadError && (
                  <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>{downloadError}</div>
                )}
                {td.attachments.map(file => (
                  <div key={file.attachment_id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb" }}>
                    <i className="ti ti-paperclip" style={{ fontSize: 18 }}></i>
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

          <div className="card">
            <div className="card-header"><span className="card-title">Conversation</span></div>
            {td.conversation && td.conversation.length > 0 ? (
              td.conversation.map(msg => (
                <div key={msg.conversation_id} className={msg.sender_type === "external" ? "chat-right" : "chat-left"}>
                  <strong>{msg.username}</strong>
                  <p>{msg.message_text}</p>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{new Date(msg.created_at).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: "#6b7280" }}>No messages yet</p>
            )}
          </div>

          
          {isClosed ? (
            <div className="card" style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
              <p style={{ fontWeight: 600 }}>🔒 This ticket is closed. No further messages allowed.</p>
            </div>
          ) : (
            <div className="card">
              <div className="card-header"><span className="card-title">Continue Conversation</span></div>
              <textarea
                className="search-input"
                rows={4}
                placeholder="Describe the current situation..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                style={{ width: "100%", marginBottom: 16, resize: "vertical" }}
              />
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Suggested Responses For Internal Team</div>
              {expectedResponses.map((resp, index) => (
                <div key={index} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <input className="search-input" value={resp} placeholder="Enter response option..." onChange={(e) => updateResponse(index, e.target.value)} />
                  <button className="btn-close" onClick={() => removeResponseField(index)}>-</button>
                </div>
              ))}
              <button className="btn-sm btn-sm-blue" onClick={addResponseField} style={{ marginBottom: 20 }}>+ Add Response Option</button>
              <div><button className="btn-ack" onClick={sendReply}>Send Reply</button></div>
            </div>
          )}
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

      
      {showCloseConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Close Ticket</h2>
            <p>Are you sure you want to close this ticket? This action cannot be undone and no further messages will be allowed.</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCloseConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={closeTicket}>Close Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
