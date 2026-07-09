import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";


export default function NotificationModal({
  selectedNotification,
  setSelectedNotification,
  acknowledgeNotification,
  setShowForwardModal,
}) {
  
const [notification, setNotification] = useState(null);
  

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

        <label>Acknowledged By Departments</label>

        <div
            style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 8
            }}
        >

            {notification.acknowledged_departments.map(dep => (

                <span
                    key={dep}
                    className="badge badge-open"
                >
                    {dep}
                </span>

            ))}

        </div>

    </div>

)}


        
        {notification?.attachments?.length > 0 && (

    <div className="message-box">

        <label>Attachments</label>

        {notification.attachments.map(file => (

            <div key={file.attachment_id} style={{ marginTop: 8 }}>

                <a
                    href={`http://localhost:3000/${file.file_location}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    📎 {file.file_name}
                </a>

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
