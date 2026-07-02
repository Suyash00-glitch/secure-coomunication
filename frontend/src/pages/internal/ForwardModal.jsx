export default function ForwardModal({
  showForwardModal,
  selectedNotification,
  setShowForwardModal,
  setSelectedNotification,
  setToast,
}) {
  if (!showForwardModal || !selectedNotification) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">Forward Notification</div>
        <div className="modal-body">
          <p>Forward notification:</p>
          <strong>{selectedNotification.subject}</strong>
          <br /><br />
          <select style={{ width: "100%", padding: "10px" }}>
            <option>Finance Team</option>
            <option>HR Team</option>
            <option>Legal Team</option>
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => {
            setToast("Notification forwarded");
            setShowForwardModal(false);
            setSelectedNotification(null);
            setTimeout(() => setToast(""), 3000);
          }}>Forward</button>
          <button className="btn" onClick={() => {
            setShowForwardModal(false);
            setSelectedNotification(null);
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
