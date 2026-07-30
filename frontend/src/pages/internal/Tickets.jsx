import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiJson } from "../../api/client";
import { getSocket } from "../../socket";
import { useAuth } from "../../auth/AuthContext";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");


  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
const pageSize = 10;

  useEffect(() => {
  loadTickets();

  const socket = getSocket();
  if (!socket) return;

  const handler = (data) => {
    console.log(" ticket event received", data);
    loadTickets();
  };

  socket.on("ticket-updated", handler);
  socket.on("new-ticket", handler); 

  return () => {
    socket.off("ticket-updated", handler);
    socket.off("new-ticket", handler); 
  };
}, []);


useEffect(() => {
  setPage(1);
}, [search, statusFilter]);


  async function loadTickets() {
    try {
      const { res, data } = await apiJson("/api/internal/tickets");
      if (res.ok) {
        setTickets(data.map(t => ({
          ticket_id: t.ticket_id,
          id: `TKT-${String(t.ticket_id).padStart(4, "0")}`,
          user: t.created_by,
          issue: t.title,
          description: t.description,
          status: t.status_name,
          updated: new Date(t.created_at).toLocaleString(),
          acknowledged: t.acknowledgement_at !== null,
          assigned_to: t.assigned_to,
        })));
      }
    } catch (err) { console.log(err); }
  }

  async function acknowledgeTicket(id) {
  try {

    const { res } = await apiJson(
      `/api/internal/tickets/${id}/acknowledge`,
      {
        method: "PATCH"
      }
    );

    if (res.ok) {
      loadTickets();
    }

  }
  catch(err){
    console.log(err);
  }
}


const filtered = tickets.filter((t) => {
  const q = search.trim().toLowerCase();

  const matchesSearch =
    !q ||
    t.id.toLowerCase().includes(q) ||
    t.user.toLowerCase().includes(q) ||
    t.issue.toLowerCase().includes(q);

  const matchesStatus =
    statusFilter === "All" ||
    t.status.toLowerCase() === statusFilter.toLowerCase();

  return matchesSearch && matchesStatus;
});

const totalPages = Math.ceil(filtered.length / pageSize);

const paginatedTickets = filtered.slice(
  (page - 1) * pageSize,
  page * pageSize
);



  function openTicket(id) {
    navigate(`/internal/tickets/${id}`);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tickets from External Users</div>
          <div className="page-sub">Manage and respond to all incoming support tickets</div>
        </div>
      </div>
      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <input
  className="search-input"
  placeholder="Search by ticket ID, issue, user..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
          </div>
          <select
  className="filter-select"
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
            <option>All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ticket ID</th><th>External User</th><th>Issue Title</th><th>Status</th><th>Last Updated</th><th>Actions</th></tr></thead>
            <tbody>
              {paginatedTickets.map(t => (
                <tr key={t.id}>
                  <td><span className="td-id">{t.id}</span></td>
                  <td>{t.user}</td>
                  <td>{t.issue}</td>
                  <td><span className={`badge ${t.status === "Open" ? "badge-open" : t.status === "Closed" ? "badge-closed" : "badge-process"}`}>{t.status}</span></td>
                  <td>{t.updated}</td>
                  <td>
                    <div className="action-cluster">
                     {t.status === "Closed" ? (

  <button className="btn-sm" disabled style={{ opacity: 0.5 }}>
    Closed
  </button>

) : !t.acknowledged ? (

  <>
  <button
    className="btn-sm btn-sm-blue" 
   onClick={() => navigate(`/internal/tickets/${t.ticket_id}?view=true`)}
  >
    View
  </button>

  <button
    className="btn-sm btn-sm-green"
    onClick={() => acknowledgeTicket(t.ticket_id)}
  >
    Acknowledge
  </button>
</>

) : t.assigned_to === user?.user_id ? (

  <button
    className="btn-sm btn-sm-green"
    onClick={() => openTicket(t.ticket_id)}
  >
    Continue
  </button>

) : (

  <button
    className="btn-sm"
    disabled
    style={{ opacity: 0.5 }}
  >
    Being Handled
  </button>

)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pag-row">
          <span style={{ fontSize: 12, color: "#6b7280" }}>{`Showing ${paginatedTickets.length} of ${tickets.length} records`}</span>
          <div className="pagination">
            <button
  className="pg-btn"
  disabled={page === 1}
  onClick={() => setPage(page - 1)}
>
  Previous
</button>

<button className="pg-btn active">
  {page}
</button>

<button
  className="pg-btn"
  disabled={page === totalPages || totalPages === 0}
  onClick={() => setPage(page + 1)}
>
  Next
</button>
          </div>
        </div>
      </div>
    </div>
  );
}
