import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiJson, downloadAttachment } from "../../api/client";
import { getSocket } from "../../socket";
import { useSearchParams } from "react-router-dom";

export default function TicketConversation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchParams] = useSearchParams();
  const [showForwardConfirm, setShowForwardConfirm] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  async function handleDownloadAttachment(file) {
    setDownloadError("");
    setDownloadingId(file.attachment_id);
    const result = await downloadAttachment(
      `/api/tickets/${ticket.ticket_id}/attachments/${file.attachment_id}/download`,
      file.file_name,
    );
    if (!result.ok) setDownloadError(result.message);
    setDownloadingId(null);
  }

  const viewOnly = searchParams.get("view") === "true";
  const isClosed = ticket?.status_name?.toLowerCase() === "closed";

  async function loadTicket() {
    const { res, data } = await apiJson(`/api/internal/tickets/${id}`);
    if (res.ok) setTicket(data);
  }

  async function loadConversation() {
    const { res, data } = await apiJson(`/api/internal/tickets/${id}/conversation`);
    if (res.ok) setConversation(data);
  }

  async function loadResponses() {
    const { res, data } = await apiJson(`/api/internal/tickets/${id}/responses`);
    if (res.ok) setResponses(data);
  }

  useEffect(() => {
    loadTicket();
    loadConversation();
    loadResponses();

    const socket = getSocket();
    if (!socket) {
      console.log("socket not ready");
      return;
    }

    socket.emit("join-ticket", id);

    const handler = () => {
      console.log(" ticket updated");
      loadConversation();
      loadResponses();
      loadTicket();
    };

    socket.on("ticket-conversation-updated", handler);
    socket.on("ticket-closed", handler);

    return () => {
      socket.off("ticket-conversation-updated", handler);
      socket.off("ticket-closed", handler);
    };
  }, [id]);

  async function sendResponse() {
    console.log("send clicked");
    if (!selectedResponse) return;
    try {
      const { res } = await apiJson(`/api/internal/tickets/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response_id: selectedResponse })
      });
      if (res.ok) {
        setShowConfirm(false);
        setSelectedResponse(null);
        loadConversation();
        loadResponses();
      }
    } catch (err) { console.log(err); }
  }

  
  async function forwardTicket() {
  try {
    const { res } = await apiJson(`/api/internal/tickets/${id}/forward`, {
      method: "PATCH"
    });
    if (res.ok) {
      setShowForwardConfirm(false);
      navigate("/internal/tickets"); // go back to list after forwarding
    }
  } catch (err) { console.log(err); }
}




  if (!ticket) return <div className="page-header"><div><div className="page-title">Loading...</div></div></div>;

  return (
    <div>
      <div className="page-header">
  <button
    className="btn"
    onClick={() => navigate("/internal/tickets")}
    style={{ marginRight: "20px" }}
  >
    Back
  </button>

  <div>
    <div className="page-title">TKT-{ticket.ticket_id}</div>
    <div className="page-sub">Status: {ticket.status_name}</div>
  </div>
      
      
      
{!viewOnly && !isClosed && ticket?.assigned_to && (
  <button
    className="btn btn-secondary"
    onClick={() => setShowForwardConfirm(true)}
    style={{ marginLeft: "auto" }}
  >
    Forward Ticket
  </button>
)}



      </div>



      <div className="card">
        <h3>Ticket Details</h3>
        <div className="detail-grid">
          <div className="detail-item"><label>Ticket ID</label><span>TKT-{ticket.ticket_id}</span></div>
          <div className="detail-item"><label>Status</label><span>{ticket.status_name}</span></div>
          <div className="detail-item"><label>Created By</label><span>{ticket.created_by_name}</span></div>
          <div className="detail-item"><label>Created On</label><span>{new Date(ticket.created_at).toLocaleString()}</span></div>
        </div>
        <div className="subject-box"><label>Issue</label><div>{ticket.title}</div></div>
        <div className="message-box"><label>Description</label><div>{ticket.description}</div></div>

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="message-box">
            <label>Attachments</label>
            {downloadError && (
              <div style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{downloadError}</div>
            )}
            {ticket.attachments.map(file => (
              <div key={file.attachment_id} style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: 10 }}>
                <span>📎 {file.file_name}</span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleDownloadAttachment(file)}
                  disabled={downloadingId === file.attachment_id}
                >
                  {downloadingId === file.attachment_id ? "Downloading..." : "Download"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!viewOnly && (
        <div className="card">
          <h3>Conversation</h3>
          {conversation.map(msg => (
            <div key={msg.conversation_id} className={msg.sender_type === "internal" ? "chat-right" : "chat-left"}>
              <strong>{msg.username}</strong>
              <p>{msg.message_text}</p>
            </div>
          ))}
        </div>
      )}

      {!viewOnly && (
        isClosed ? (
          <div className="card" style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
            <p style={{ fontWeight: 600 }}> This ticket is closed. No further responses allowed.</p>
          </div>
        ) : (
          <div className="card">
            <h3>Available Responses</h3>
            {responses.map(r => (
              <label key={r.response_id} className={`response-option ${selectedResponse === r.response_id ? "selected-response" : ""}`}>
                <div className="response-content">
                  <input
                    type="radio"
                    name="response"
                    checked={selectedResponse === r.response_id}
                    onChange={() => setSelectedResponse(Number(r.response_id))}
                  />
                  <span>{r.response_text}</span>
                </div>
              </label>
            ))}
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                className="btn-send-response"
                disabled={!selectedResponse}
                onClick={() => setShowConfirm(true)}
              >
                Send Response
              </button>
            </div>
          </div>
        )
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Response</h2>
            <p>Are you sure you want to send this response?</p>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-ack" onClick={sendResponse}>Send</button>
            </div>
          </div>
        </div>
      )}
      

      {showForwardConfirm && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Forward Ticket</h2>
      <p>This will release the ticket back to the department queue so another team member can pick it up. The full conversation history will be preserved.</p>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={() => setShowForwardConfirm(false)}>Cancel</button>
        <button className="btn btn-primary" onClick={forwardTicket}>Forward</button>
      </div>
    </div>
  </div>
)}
      


    </div>
  );
}
