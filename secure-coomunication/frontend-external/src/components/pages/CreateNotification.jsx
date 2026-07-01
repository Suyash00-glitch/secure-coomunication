import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";

/**
 * Create Notification form — submits to POST /api/notifications.
 * All IDs and class names preserved from original.
 */
export default function CreateNotification({ onNavigate }) {
  const [notifTitle, setNotifTitle] = useState("");
  const [notifDescription, setNotifDescription] = useState("");
  const [departments, setDepartments] = useState([]);
const [notifDeptChecked, setNotifDeptChecked] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
  async function loadDepartments() {
    try {
      const { res, data } = await apiJson("/api/departments");

      if (res.ok) {
        setDepartments(data);

        const checked = {};
        data.forEach(d => {
          checked[d.department_name] = false;
        });

        setNotifDeptChecked(checked);
      }
    } catch (err) {
      console.error(err);
    }
  }

  loadDepartments();
}, []);

 function getDepartmentValues() {
  return Object.keys(notifDeptChecked).filter(
    key => notifDeptChecked[key]
  );
}

  async function createNotify() {
    setSubmitting(true);
    try {
      const title = notifTitle;
      const description = notifDescription;
      const departments = getDepartmentValues();

      const { res, data } = await apiJson("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
  title,
  description,
  department_names: departments
})
      });

      console.log(data);

      if (res.ok) {
        alert("Notification created");
        onNavigate("notif-list");
      } else {
        alert(data.error);
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

departments.forEach(d => {
  checked[d.department_name] = false;
});

setNotifDeptChecked(checked);
      onNavigate("dashboard");
    }
  }

  return (
    <div className={true ? "page active" : "page"} id="page-create-notif">
      <form id="notification-form" onSubmit={e => e.preventDefault()}>
        <div className="page-header">
          <div><div className="page-title">Create Notification</div><div className="page-sub">Publish a notification to one or more departments</div></div>
        </div>
        <div className="card" style={{ maxWidth: 780 }}>
          <div className="form-full">
            <label className="form-label">Notification Title <span style={{ color: "#ef4444" }}>*</span></label>
            <input className="form-input" id="text-29" placeholder="e.g. Annual Budget Review — Action Required" type="text" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} />
          </div>
          <div className="form-full">
            <label className="form-label">Notification Description <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea className="form-textarea" id="textarea-30" placeholder="Provide detailed information about this notification…" style={{ height: 110 }} value={notifDescription} onChange={e => setNotifDescription(e.target.value)}></textarea>
          </div>
          <div className="form-full">
            <label className="form-label">Select Departments <span style={{ color: "#ef4444" }}>*</span></label>
            <div style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: 12 }}>
              <div className="dept-checkboxes">
               {departments.map(d => (
  <label className="dept-check" key={d.department_id}>
    <input
      id={d.department_name}
      type="checkbox"
      checked={!!notifDeptChecked[d.department_name]}
      onChange={e =>
        setNotifDeptChecked(prev => ({
          ...prev,
          [d.department_name]: e.target.checked
        }))
      }
    />
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
            <button className="btn btn-secondary" id="button-38" onClick={cancelNotify}>Cancel</button>
            <button className="btn btn-primary" id="button-39" onClick={createNotify} disabled={submitting}>
              <i className="ti ti-send"></i> {submitting ? "Publishing…" : "Publish Notification"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
