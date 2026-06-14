import { useState } from "react";

const DEPARTMENTS = ["Finance", "IT Support", "Human Resources", "Legal", "Operations", "Administration", "Procurement"];

const styles = {
  body: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: 14, color: "#1a1a1a", background: "#f4f6f9", minHeight: "100vh", padding: 24 },
  tabs: { display: "flex", gap: 0, marginBottom: 24, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", width: "fit-content" },
  tab: (active) => ({ padding: "10px 28px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: active ? "#1a73e8" : "transparent", color: active ? "#fff" : "#6b7280", transition: "all .15s" }),
  card: { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 28, maxWidth: 760 },
  pageHeader: { marginBottom: 20 },
  pageTitle: { fontSize: 20, fontWeight: 600, margin: 0 },
  pageSub: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  formFull: { marginBottom: 16 },
  label: { display: "block", fontSize: 12, fontWeight: 500, color: "#6b7280", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  select: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, background: "#fff", color: "#374151", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, color: "#1a1a1a", resize: "vertical", height: 90, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  uploadBox: { border: "2px dashed #d1d5db", borderRadius: 8, padding: 24, textAlign: "center", color: "#6b7280", fontSize: 13, cursor: "pointer" },
  formActions: { display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" },
  btnPrimary: { padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: "#1a73e8", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 },
  btnSecondary: { padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid #d1d5db", background: "#f3f4f6", color: "#1a1a1a" },
  deptCheckboxes: { display: "flex", flexWrap: "wrap", gap: 12, padding: "8px 0" },
  deptCheck: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", color: "#374151" },
  successBanner: { background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: "12px 16px", color: "#166534", fontSize: 13, fontWeight: 500, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 },
  divider: { borderBottom: "1px solid #f3f4f6", margin: "20px 0" },
};

function CreateTicket() {
  const [form, setForm] = useState({ subject: "", department: "", priority: "", description: "", expectedAction: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.department) e.department = "Select a department";
    if (!form.priority) e.priority = "Select a priority";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) { setSubmitted(true); setForm({ subject: "", department: "", priority: "", description: "", expectedAction: "" }); }
  };

  const inputStyle = (field) => ({ ...styles.input, borderColor: errors[field] ? "#ef4444" : "#d1d5db" });

  return (
    <div>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>Create New Ticket</div>
        <div style={styles.pageSub}>Submit a request to the relevant department</div>
      </div>
      <div style={styles.card}>
        {submitted && (
          <div style={styles.successBanner}>
            <span style={{ fontSize: 16 }}>✓</span>
            Ticket submitted successfully! You will receive a confirmation shortly.
          </div>
        )}

        <div style={styles.formFull}>
          <label style={styles.label}>Ticket Subject *</label>
          <input style={inputStyle("subject")} placeholder="e.g. VPN Access Request for Remote Work" value={form.subject} onChange={e => set("subject", e.target.value)} />
          {errors.subject && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.subject}</div>}
        </div>

        <div style={styles.formRow}>
          <div>
            <label style={styles.label}>Department *</label>
            <select style={{ ...styles.select, borderColor: errors.department ? "#ef4444" : "#d1d5db" }} value={form.department} onChange={e => set("department", e.target.value)}>
              <option value="">Select Department</option>
              {["Finance", "IT Support", "Human Resources", "Legal", "Operations"].map(d => <option key={d}>{d}</option>)}
            </select>
            {errors.department && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.department}</div>}
          </div>
          <div>
            <label style={styles.label}>Priority *</label>
            <select style={{ ...styles.select, borderColor: errors.priority ? "#ef4444" : "#d1d5db" }} value={form.priority} onChange={e => set("priority", e.target.value)}>
              <option value="">Select Priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            {errors.priority && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.priority}</div>}
          </div>
        </div>

        <div style={styles.formFull}>
          <label style={styles.label}>Description *</label>
          <textarea style={{ ...styles.textarea, borderColor: errors.description ? "#ef4444" : "#d1d5db" }} placeholder="Describe your request in detail..." value={form.description} onChange={e => set("description", e.target.value)} />
          {errors.description && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.description}</div>}
        </div>

        <div style={styles.formFull}>
          <label style={styles.label}>Expected Response / Action Required</label>
          <textarea style={styles.textarea} placeholder="What outcome are you expecting from this ticket?" value={form.expectedAction} onChange={e => set("expectedAction", e.target.value)} />
        </div>

        <div style={styles.divider} />

        <div>
          <label style={styles.label}>Attachments</label>
          <div style={styles.uploadBox}>
            <div style={{ fontSize: 28, color: "#9ca3af", marginBottom: 6 }}>📎</div>
            Drag & drop files here, or <span style={{ color: "#1a73e8", cursor: "pointer" }}>browse</span>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Supported: PDF, DOCX, XLSX, PNG, JPG — Max 10MB</div>
          </div>
        </div>

        <div style={styles.formActions}>
          <button style={styles.btnSecondary} onClick={() => { setForm({ subject: "", department: "", priority: "", description: "", expectedAction: "" }); setErrors({}); setSubmitted(false); }}>Cancel</button>
          <button style={styles.btnPrimary} onClick={handleSubmit}>🎫 Submit Ticket</button>
        </div>
      </div>
    </div>
  );
}

function CreateNotification() {
  const [form, setForm] = useState({ title: "", description: "", departments: [] });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDept = (dept) => {
    setForm(f => ({
      ...f,
      departments: f.departments.includes(dept)
        ? f.departments.filter(d => d !== dept)
        : [...f.departments, dept]
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (form.departments.length === 0) e.departments = "Select at least one department";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) { setSubmitted(true); setForm({ title: "", description: "", departments: [] }); }
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>Create Notification</div>
        <div style={styles.pageSub}>Publish a notification to one or more departments</div>
      </div>
      <div style={styles.card}>
        {submitted && (
          <div style={styles.successBanner}>
            <span style={{ fontSize: 16 }}>✓</span>
            Notification published successfully to selected departments.
          </div>
        )}

        <div style={styles.formFull}>
          <label style={styles.label}>Notification Title *</label>
          <input
            style={{ ...styles.input, borderColor: errors.title ? "#ef4444" : "#d1d5db" }}
            placeholder="e.g. Annual Budget Review Circular"
            value={form.title}
            onChange={e => set("title", e.target.value)}
          />
          {errors.title && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.title}</div>}
        </div>

        <div style={styles.formFull}>
          <label style={styles.label}>Notification Description *</label>
          <textarea
            style={{ ...styles.textarea, height: 110, borderColor: errors.description ? "#ef4444" : "#d1d5db" }}
            placeholder="Write the notification message here..."
            value={form.description}
            onChange={e => set("description", e.target.value)}
          />
          {errors.description && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.description}</div>}
        </div>

        <div style={styles.divider} />

        <div style={styles.formFull}>
          <label style={styles.label}>Select Departments *</label>
          <div style={{ border: errors.departments ? "1px solid #ef4444" : "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", background: "#f9fafb" }}>
            <div style={styles.deptCheckboxes}>
              {DEPARTMENTS.map(dept => (
                <label key={dept} style={styles.deptCheck}>
                  <input
                    type="checkbox"
                    checked={form.departments.includes(dept)}
                    onChange={() => toggleDept(dept)}
                    style={{ accentColor: "#1a73e8", width: 15, height: 15 }}
                  />
                  {dept}
                </label>
              ))}
            </div>
          </div>
          {errors.departments && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.departments}</div>}
          {form.departments.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#1a73e8" }}>
              Selected: {form.departments.join(", ")}
            </div>
          )}
        </div>

        <div style={styles.divider} />

        <div>
          <label style={styles.label}>Attachments</label>
          <div style={styles.uploadBox}>
            <div style={{ fontSize: 28, color: "#9ca3af", marginBottom: 6 }}>📎</div>
            Attach files if any — <span style={{ color: "#1a73e8", cursor: "pointer" }}>browse</span>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>PDF, DOCX, XLSX supported — Max 25MB per file</div>
          </div>
        </div>

        <div style={styles.formActions}>
          <button style={styles.btnSecondary} onClick={() => { setForm({ title: "", description: "", departments: [] }); setErrors({}); setSubmitted(false); }}>Cancel</button>
          <button style={styles.btnPrimary} onClick={handleSubmit}>🔔 Publish Notification</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("ticket");

  return (
    <div style={styles.body}>
      <div style={styles.tabs}>
        <button style={styles.tab(tab === "ticket")} onClick={() => setTab("ticket")}>🎫 Create Ticket</button>
        <button style={styles.tab(tab === "notif")} onClick={() => setTab("notif")}>🔔 Create Notification</button>
      </div>
      {tab === "ticket" ? <CreateTicket /> : <CreateNotification />}
    </div>
  );
}
