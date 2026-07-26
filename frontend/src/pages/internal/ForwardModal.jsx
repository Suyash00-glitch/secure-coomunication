import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";

export default function ForwardModal({
  showForwardModal,
  selectedNotification,
  setShowForwardModal,
  setSelectedNotification,
  setToast,
}) {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showForwardModal) return;
    async function loadDepts() {
      try {
        const { res, data } = await apiJson("/api/departments/active");
        if (res.ok) setDepartments(data);
      } catch (err) { console.log(err); }
    }
    loadDepts();
    setSelectedDept("");
    setError("");
  }, [showForwardModal]);

  if (!showForwardModal || !selectedNotification) return null;

  async function handleForward() {
    if (!selectedDept) { setError("Please select a department"); return; }
    setLoading(true);
    setError("");
    try {
      const { res, data } = await apiJson(
        `/api/internal/notifications/${selectedNotification.notification_id}/forward`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ department_name: selectedDept })
        }
      );
      if (res.ok) {
        setToast("Notification forwarded successfully");
        setTimeout(() => setToast(""), 3000);
        setShowForwardModal(false);
        setSelectedNotification(null);
      } else {
        setError(data?.message || "Failed to forward");
      }
    } catch (err) {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Forward Notification</h2>
          <button className="modal-close" onClick={() => { setShowForwardModal(false); setSelectedNotification(null); }}>✕</button>
        </div>
        <div className="modal-content">
          <p style={{ marginBottom: 12, fontSize: 13, color: "#374151" }}>
            Forwarding: <strong>{selectedNotification.subject}</strong>
          </p>
          <div className="form-full">
            <label className="form-label">Select Department</label>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setError(""); }}
            >
              <option value="">Select department...</option>
              {departments.map(d => (
                <option key={d.department_id} value={d.department_name}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>
          {error && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => { setShowForwardModal(false); setSelectedNotification(null); }}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleForward} disabled={loading}>
            {loading ? "Forwarding..." : "Forward"}
          </button>
        </div>
      </div>
    </div>
  );
}