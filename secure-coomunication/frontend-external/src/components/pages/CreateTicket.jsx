import { useState, useEffect } from "react";
import { RESPONSE_OPTIONS } from "../../constants";

/**
 * Create Ticket form — submits to POST /api/tickets.
 * All IDs and class names preserved from original.
 */
export default function CreateTicket({ onNavigate, onTicketCreated }) {
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDept, setTicketDept] = useState("select_department");

  const [ticketDescription, setTicketDescription] = useState("");
  const [expectedResponses, setExpectedResponses] = useState([]);
  const [customResponseInput, setCustomResponseInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {

  async function loadDepartments() {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:3000/api/departments/active",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      console.log(data);

      if (res.ok) {
        setDepartments(data);
      }

    } catch (err) {
      console.log(err);
    }

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
    setSubmitting(true);
    try {
      const title = ticketTitle;
      const department_name = ticketDept;
      const description = ticketDescription;
      const responseArray = expectedResponses;

     const token = localStorage.getItem("token");

const res = await fetch(
  "http://localhost:3000/api/tickets",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title,
      department: department_name,
      description,
      expectedResponses: responseArray
    })
  }
);

const data = await res.json();

      console.log(data);

      if (res.ok) {

  setTicketTitle("");
  setTicketDept("select_department");
  setTicketDescription("");
  setExpectedResponses([]);
  setCustomResponseInput("");

  alert("Ticket created successfully.");

  if (onTicketCreated) {
    onNavigate("ticket-list");
  }

}
      }
    catch (err) {
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
      onNavigate("dashboard");
    }
  }

  return (
    <div className={true ? "page active" : "page"} id="page-create-ticket">
      <form id="ticket-form" onSubmit={e => e.preventDefault()}>
        <div className="page-header">
          <div><div className="page-title">Create New Ticket</div><div className="page-sub">Submit a request to the relevant department</div></div>
        </div>
        <div className="card" style={{ maxWidth: 780 }}>
          <div className="form-full">
            <label className="form-label">Ticket Subject <span style={{ color: "#ef4444" }}>*</span></label>
            <input className="form-input" id="text-20" placeholder="Brief description of your issue…" type="text" value={ticketTitle} onChange={e => setTicketTitle(e.target.value)} />
          </div>
          <div className="form-row">
            <div>
              <label className="form-label">Department <span style={{ color: "#ef4444" }}>*</span></label>
              <select
  className="form-select"
  id="select-21"
  value={ticketDept}
  onChange={e => setTicketDept(e.target.value)}
>
  <option value="select_department">Select Department</option>

  {departments.map((dept) => (
    <option
      key={dept.department_id}
      value={dept.department_name}
    >
      {dept.department_name}
    </option>
  ))}
</select>
            </div>
           
          </div>
          <div className="form-full">
            <label className="form-label">Description <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea className="form-textarea" id="textarea-23" placeholder="Describe the issue in detail — include relevant reference numbers, dates, and any supporting context…" value={ticketDescription} onChange={e => setTicketDescription(e.target.value)}></textarea>
          </div>

          <div className="form-full" data-response-block="true">
            <label className="form-label">Expected Response / Action Required</label>

            <div className="response-options" data-options="true">
              {RESPONSE_OPTIONS.map(opt => {
                const added = expectedResponses.includes(opt);
                return (
                  <div key={opt} className={added ? "option-item option-added" : "option-item"} data-value={opt}>
                    <span>{opt}</span>
                    <button type="button" className="btn-add" disabled={added} onClick={() => addValue(opt)}>+</button>
                  </div>
                );
              })}

              <div className="option-item custom-option">
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Type your own..."
                  value={customResponseInput}
                  onChange={e => setCustomResponseInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomValue();
                    }
                  }}
                />
                <button type="button" className="btn-add-custom" onClick={addCustomValue}>+</button>
              </div>
            </div>

            <div className="response-selected">
              <label className="form-sublabel">Selected:</label>
              <div className="selected-list" data-selected-list="true">
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
            <label className="form-label">Attachments</label>
            <div className="upload-box">
              <i className="ti ti-upload"></i>
              Drag &amp; drop files here, or <span className="upload-link">browse</span><br />
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Supported: PDF, DOCX, XLSX, PNG, JPG — Max 10MB</span>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" id="button-25" onClick={cancelTick}>Cancel</button>
            <button className="btn btn-primary" id="button-26" onClick={createTick} disabled={submitting}>
              <i className="ti ti-send"></i> {submitting ? "Submitting…" : "Submit Ticket"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
