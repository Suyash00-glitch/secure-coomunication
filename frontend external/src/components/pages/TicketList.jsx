import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";

function fmtDate(d) {
  return new Date(d).toLocaleDateString();
}

/**
 * Ticket List — fetches tickets from GET /api/tickets.
 */
export default function TicketList({ onNavigate, onOpenTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const { res, data } = await apiJson("/api/tickets");
      if (res.ok) {
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={true ? "page active" : "page"} id="page-ticket-list">
      <div className="page-header">
        <div><div className="page-title">My Tickets</div><div className="page-sub">Track and manage all submitted tickets</div></div>
        <button className="btn btn-primary" id="button-5" onClick={() => onNavigate("create-ticket")}><i className="ti ti-plus"></i> Create Ticket</button>
      </div>
      <div className="card">
        <div className="search-row">
          <div className="search-wrap"><i className="ti ti-search"></i><input className="search-input" id="text-6" placeholder="Search by ticket ID, subject…" type="text" /></div>
          <select className="filter-select" id="select-7" defaultValue="all_statuses">
            <option value="all_statuses">All Statuses</option>
            <option value="open">Open</option>
            <option value="under_process">Under Process</option>
            <option value="closed">Closed</option>
          </select>
          <select className="filter-select" id="select-8" defaultValue="all_departments">
            <option value="all_departments">All Departments</option>
            <option value="finance">Finance</option>
            <option value="it_support">IT Support</option>
            <option value="hr">HR</option>
            <option value="legal">Legal</option>
          </select>
        </div>
        <table>
          <thead><tr><th>Ticket ID</th><th>Subject</th><th>Department</th><th>Priority</th><th>Status</th><th>Created Date</th><th>Last Updated</th><th>Action</th></tr></thead>
          <tbody id="ticket-body">
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>Loading tickets…</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>No tickets found</td></tr>
            ) : (
              tickets.map(t => (
                <tr key={t.ticket_id}>
                  <td style={{ color: "#1a73e8", fontWeight: 600 }}>TKT-{String(t.ticket_id).padStart(4, "0")}</td>
                  <td>{t.title}</td>
                  <td>{t.department_name}</td>
                  <td>-</td>
                  <td><span className="badge">{t.status_name}</span></td>
                  <td>{fmtDate(t.created_at)}</td>
                  <td>{fmtDate(t.updated_at)}</td>
                  <td><button className="action-btn" onClick={() => onOpenTicket(t.ticket_id)}>View</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* TODO: Implement server-side pagination when backend supports it */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {loading ? "Loading…" : `Showing ${tickets.length} records`}
          </span>
          <div className="pagination">
            <button className="pg-btn" id="button-15">Previous</button>
            <button className="pg-btn active" id="button-16">1</button>
            {/* TODO: Dynamic page buttons when pagination endpoint is available */}
            <button className="pg-btn" id="button-19">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
