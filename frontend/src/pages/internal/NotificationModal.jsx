import { useEffect, useState } from "react";
import { apiJson, downloadAttachment } from "../../api/client";


export default function NotificationModal({
  selectedNotification,
  setSelectedNotification,
  acknowledgeNotification,
  setShowForwardModal,
}) {
  
const [notification, setNotification] = useState(null);
const [downloadingId, setDownloadingId] = useState(null);
const [downloadError, setDownloadError] = useState("");

async function handleDownloadAttachment(file) {
    setDownloadError("");
    setDownloadingId(file.attachment_id);
    const result = await downloadAttachment(
        `/api/notifications/${selectedNotification.notification_id}/attachments/${file.attachment_id}/download`,
        file.file_name,
    );
    if (!result.ok) setDownloadError(result.message);
    setDownloadingId(null);
}
  

useEffect(() => {

    async function loadNotification() {

        if (!selectedNotification) return;

        try {

            const { res, data } = await apiJson(
                `/api/internal/notifications/${selectedNotification.notification_id}`
            );

            if (res.ok) {
                setNotification(data);
            }

        } catch (err) {
            console.log(err);
        }

    }

    loadNotification();

}, [selectedNotification]);

  if (!selectedNotification) return null;

   
  
  return (
    <div className="modal-overlay">
      <div className="modal notification-modal">
        <div className="modal-header">
          <h2>{selectedNotification.id} — Notification Details</h2>
          <button className="modal-close" onClick={() => setSelectedNotification(null)}>✕</button>
        </div>
        <div className="modal-content">
          <div className="detail-grid">
            <div className="detail-item"><label>Notification ID</label><span>{selectedNotification.id}</span></div>
            <div className="detail-item"><label>Sender</label><span>{selectedNotification.sender}</span></div>
            <div className="detail-item"><label>Date & Time</label><span>{selectedNotification.datetime}</span></div>
            <div className="detail-item"><label>Priority</label><span className="priority-pill high">{selectedNotification.priority || "Normal"}</span></div>
            <div className="detail-item"><label>Status</label><span className={`status-pill ${selectedNotification.status === "Acknowledged" ? "ack" : "unread"}`}>{selectedNotification.status}</span></div>
          </div>
          <div className="subject-box"><label>Subject</label><div>{selectedNotification.subject}</div></div>
          <div className="message-box"><label>Message Body</label><div>{notification?.description || selectedNotification.description}</div></div>
          

       {notification?.acknowledged_departments?.length > 0 && (

    <div className="message-box">

        <label>Acknowledgements</label>

        {notification.acknowledged_departments.map((dep, index) => (

            <div
                key={index}
                style={{
                    marginTop: 8,
                    padding: "8px 0",
                    borderBottom: "1px solid #eee"
                }}
            >
                <div>
                    {dep.department_name} — {dep.acknowledged_by}
                </div>

                <div
                    style={{
                        fontSize: 12,
                        color: "#6b7280"
                    }}
                >
                    {dep.acknowledged_at
                        ? new Date(dep.acknowledged_at).toLocaleString()
                        : "Time unavailable"}
                </div>
            </div>

        ))}

    </div>

)}

        
        {notification?.attachments?.length > 0 && (

    <div className="message-box">

        <label>Attachments</label>

        {downloadError && (
            <div style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{downloadError}</div>
        )}

        {notification.attachments.map(file => (

            <div key={file.attachment_id} style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>

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
        <div className="modal-footer">
          <button className="btn-close" onClick={() => {
    setNotification(null);setSelectedNotification(null);}}>Close</button>
          <button
            className="btn-ack"
            disabled={selectedNotification.status === "Acknowledged"}
            onClick={() => {
              acknowledgeNotification(selectedNotification.notification_id);
              setSelectedNotification(null);
            }}
          >
            {selectedNotification.status === "Acknowledged" ? "Acknowledged" : "Acknowledge"}
          </button>
        </div>
      </div>
    </div>
  );
}
