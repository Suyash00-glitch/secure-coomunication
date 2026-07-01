export default function NotificationModal({
  selectedNotification,
  setSelectedNotification,
  acknowledgeNotification,
  setShowForwardModal,
}) {
  if (!selectedNotification) return null;

  return (
    <div className="modal-overlay">
      <div className="modal notification-modal">
        <div className="modal-header">
          <h2>{selectedNotification.id} — Notification Details</h2>

          <button
            className="modal-close"
            onClick={() => setSelectedNotification(null)}
          >
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="detail-grid">
            <div className="detail-item">
              <label>Notification ID</label>
              <span>{selectedNotification.id}</span>
            </div>

            <div className="detail-item">
              <label>Sender</label>
              <span>{selectedNotification.sender}</span>
            </div>

            <div className="detail-item">
              <label>Date & Time</label>
              <span>{selectedNotification.datetime}</span>
            </div>

            <div className="detail-item">
              <label>Priority</label>

              <span className="priority-pill high">
                {selectedNotification.priority}
              </span>
            </div>

            <div className="detail-item">
              <label>Status</label>

              <span className="status-pill unread">
                {selectedNotification.status}
              </span>
            </div>
          </div>

          <div className="subject-box">
            <label>Subject</label>

            <div>{selectedNotification.subject}</div>
          </div>

         <div className="message-box">
  <label>Message Body</label>

  <div>
    {selectedNotification.description}
  </div>
</div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-close"
            onClick={() => setSelectedNotification(null)}
          >
            Close
          </button>

      {/*    <button
            className="btn-forward"
            onClick={() => setShowForwardModal(true)}
          >
            Forward
          </button>  */}  

         <button
  className="btn-ack"
  disabled={selectedNotification.status === "Acknowledged"}
  onClick={() => {
    acknowledgeNotification(selectedNotification.notification_id);
    setSelectedNotification(null);
  }}
>
  {selectedNotification.status === "Acknowledged"
    ? "Acknowledged"
    : "Acknowledge"}
</button>
        </div>
      </div>
    </div>
  );
}
