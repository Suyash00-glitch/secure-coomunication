import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiJson } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { RESPONSE_OPTIONS } from "../../data/constants";

const ROLE_PREFIX = { admin: "/admin", outside: "/external" };

export default function CreateTicket() {
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDept, setTicketDept] = useState("select_department");
  const [ticketDescription, setTicketDescription] = useState("");
  const [expectedResponses, setExpectedResponses] = useState([]);
  const [customResponseInput, setCustomResponseInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const navigate = useNavigate();
  const { role } = useAuth();
  const prefix = ROLE_PREFIX[role] || "/external";

  useEffect(() => {
    async function loadDepartments() {
      try {
        const { res, data } = await apiJson("/api/departments/active");
        if (res.ok) setDepartments(data);
      } catch (err) { console.log(err); }
    }
    loadDepartments();
  }, []);

  function addValue(value) {
    value = value.trim();
    if (!value) return;
    setExpectedResponses(prev => (prev.includes(value) ? prev : [...prev, value]));
  }

  function removeValue(idx) {
    setExpectedResponses(prev => prev.filter((_, i) => i !== idx));
  }

  function addCustomValue() {
    addValue(customResponseInput);
    setCustomResponseInput("");
  }

  async function createTick() {
     if (!ticketTitle.trim()) { alert("Ticket subject is required"); return; }
  if (ticketDept === "select_department") { alert("Please select a department"); return; }
  if (!ticketDescription.trim()) { alert("Description is required"); return; }
  if (expectedResponses.length === 0) { alert("Please add at least one expected response"); return; }

    setSubmitting(true);
    try {
      const { res, data } = await apiJson("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ticketTitle,
          department: ticketDept,
          description: ticketDescription,
          expectedResponses: expectedResponses
        })
      });

      if (attachment) {

    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("attachment", attachment);

    await fetch(

        `http://localhost:3000/api/tickets/${data.ticket_id}/attachment`,

        {

            method: "POST",

            headers: {
                Authorization: `Bearer ${token}`
            },

            body: formData

        }

    );

}


      if (res.ok) {
        setTicketTitle("");
        setTicketDept("select_department");
        setTicketDescription("");
        setExpectedResponses([]);
        setCustomResponseInput("");
        alert("Ticket created successfully.");
        navigate(`${prefix}/tickets`);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  function cancelTick() {
    const confirmed = confirm("Are you sure you want to cancel this ticket?");
    if (confirmed) {
      setTicketTitle("");
      setTicketDept("select_department");
      setTicketDescription("");
      setExpectedResponses([]);
      setCustomResponseInput("");
      navigate(`${prefix}/dashboard`);
    }
  }

  return (
    <div>
      <form onSubmit={e => e.preventDefault()}>
       <div className="page-header">
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
      <i className="ti ti-arrow-left"></i> Back
    </button>
    <div>
      <div className="page-title">Create New Ticket</div>
      <div className="page-sub">Submit a request to the relevant department</div>
    </div>
  </div>
</div><div className="card" style={{ maxWidth: 780 }}>
          <div className="form-full">
            <label className="form-label">Ticket Subject <span style={{ color: "#ef4444" }}>*</span></label>
            <input className="form-input" placeholder="Brief description of your issue..." type="text" value={ticketTitle} onChange={e => setTicketTitle(e.target.value)} />
          </div>
          <div className="form-row">
            <div>
              <label className="form-label">Department <span style={{ color: "#ef4444" }}>*</span></label>
              <select className="form-select" value={ticketDept} onChange={e => setTicketDept(e.target.value)}>
                <option value="select_department">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_name}>{dept.department_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-full">
            <label className="form-label">Description <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea className="form-textarea" placeholder="Describe the issue in detail..." value={ticketDescription} onChange={e => setTicketDescription(e.target.value)}></textarea>
          </div>
          <div className="form-full">
            <label className="form-label">Expected Response / Action Required</label>
            <div className="response-options">
              {RESPONSE_OPTIONS.map(opt => {
                const added = expectedResponses.includes(opt);
                return (
                  <div key={opt} className={added ? "option-item option-added" : "option-item"}>
                    <span>{opt}</span>
                    <button type="button" className="btn-add" disabled={added} onClick={() => addValue(opt)}>+</button>
                  </div>
                );
              })}
              <div className="option-item">
                <input type="text" className="custom-input" placeholder="Type your own..." value={customResponseInput} onChange={e => setCustomResponseInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomValue(); } }} />
                <button type="button" className="btn-add-custom" onClick={addCustomValue}>+</button>
              </div>
            </div>
            <div className="response-selected">
              <label className="form-label">Selected:</label>
              <div className="selected-list">
                {expectedResponses.map((val, idx) => (
                  <div className="selected-item" key={val + idx}>
                    <span>{val}</span>
                    <button type="button" className="btn-remove" onClick={() => removeValue(idx)}>-</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
       <div className="form-full">
  <label className="form-label">Attachment</label>

  <input
    type="file"
    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
    onChange={(e) => setAttachment(e.target.files[0])}
/>

  {attachment && (
    <p style={{ marginTop: 8 }}>
      📎 {attachment.name}
    </p>
  )}
</div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={cancelTick}>Cancel</button>
            <button className="btn btn-primary" onClick={createTick} disabled={submitting}>
              <i className="ti ti-send"></i> {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
