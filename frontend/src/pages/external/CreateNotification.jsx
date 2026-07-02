import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiJson } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

const ROLE_PREFIX = { admin: "/admin", outside: "/external" };

export default function CreateNotification() {
  const [notifTitle, setNotifTitle] = useState("");
  const [notifDescription, setNotifDescription] = useState("");
  const [departments, setDepartments] = useState([]);
  const [notifDeptChecked, setNotifDeptChecked] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { role } = useAuth();
  const prefix = ROLE_PREFIX[role] || "/external";

  useEffect(() => {
    async function loadDepartments() {
      try {
        const { res, data } = await apiJson("/api/departments/active");
        if (res.ok) {
          setDepartments(data);
          const checked = {};
          data.forEach(d => { checked[d.department_name] = false; });
          setNotifDeptChecked(checked);
        }
      } catch (err) { console.error(err); }
    }
    loadDepartments();
  }, []);

  function getDepartmentValues() {
    return Object.keys(notifDeptChecked).filter(key => notifDeptChecked[key]);
  }

  async function createNotify() {
    setSubmitting(true);
    try {
      const { res, data } = await apiJson("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notifTitle,
          description: notifDescription,
          department_names: getDepartmentValues()
        })
      });
      if (res.ok) {
        alert("Notification created");
        navigate(`${prefix}/notifications`);
      } else {
        alert(data.error || "Failed to create notification");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function cancelNotify() {
    const confirmed = confirm("Are you sure you want to cancel creating this notification?");
    if (confirmed) {
      setNotifTitle("");
      setNotifDescription("");
      const checked = {};
      departments.forEach(d => { checked[d.department_name] = false; });
      setNotifDeptChecked(checked);
      navigate(`${prefix}/dashboard`);
    }
  }

  return (
    <div>
      <form onSubmit={e => e.preventDefault()}>
        <div className="page-header">
          <div><div className="page-title">Create Notification</div><div className="page-sub">Publish a notification to one or more departments</div></div>
        </div>
        <div className="card" style={{ maxWidth: 780 }}>
          <div className="form-full">
            <label className="form-label">Notification Title <span style={{ color: "#ef4444" }}>*</span></label>
            <input className="form-input" placeholder="e.g. Annual Budget Review — Action Required" type="text" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} />
          </div>
          <div className="form-full">
            <label className="form-label">Notification Description <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea className="form-textarea" placeholder="Provide detailed information about this notification..." style={{ height: 110 }} value={notifDescription} onChange={e => setNotifDescription(e.target.value)}></textarea>
          </div>
          <div className="form-full">
            <label className="form-label">Select Departments <span style={{ color: "#ef4444" }}>*</span></label>
            <div style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: 12 }}>
              <div className="dept-checkboxes">
                {departments.map(d => (
                  <label className="dept-check" key={d.department_id}>
                    <input type="checkbox" checked={!!notifDeptChecked[d.department_name]}
                      onChange={e => setNotifDeptChecked(prev => ({ ...prev, [d.department_name]: e.target.checked }))} />
                    {d.department_name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="form-full">
            <label className="form-label">Attachments</label>
            <div className="upload-box">
              <i className="ti ti-paperclip"></i>
              Attach files if any — PDF, DOCX, XLSX supported<br />
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Max 25MB per file</span>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={cancelNotify}>Cancel</button>
            <button className="btn btn-primary" onClick={createNotify} disabled={submitting}>
              <i className="ti ti-send"></i> {submitting ? "Publishing..." : "Publish Notification"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
