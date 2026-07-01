export default function Tickets({
    tickets,
    openTicket
})  {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Tickets from External Users</div>

          <div className="page-sub">
            Manage and respond to all incoming support tickets
          </div>
        </div>
      </div>

      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <input
              className="search-input"
              placeholder="Search by ticket ID, issue, user..."
            />
          </div>

          <select className="filter-select">
            <option>All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>

          <select className="filter-select">
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>External User</th>
                <th>Issue Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Attach.</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="td-id">{t.id}</span>
                  </td>

                  <td>{t.user}</td>

                  <td>{t.issue}</td>

                  <td>
                    <span
                      className={`badge ${
                        t.priority === "High"
                          ? "badge-high"
                          : t.priority === "Medium"
                            ? "badge-medium"
                            : "badge-low"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        t.status === "Open"
                          ? "badge-open"
                          : t.status === "In Progress"
                            ? "badge-process"
                            : "badge-closed"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td>{t.updated}</td>

                  <td style={{ textAlign: "center" }}>
                    {t.attach ? "📎" : "-"}
                  </td>

                  <td>
                    <div className="action-cluster">
                      {t.status === "Closed" ? (
  <button
    className="btn-sm"
    disabled
    style={{ opacity: 0.5 }}
  >
    Closed
  </button>
) : t.acknowledged ? (
  <button
    className="btn-sm btn-sm-green"
    onClick={() => openTicket(t.ticket_id)}
  >
    Continue
  </button>
) : (
  <button
    className="btn-sm btn-sm-blue"
    onClick={() => openTicket(t.ticket_id)}
  >
    Acknowledge
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
          <span
            style={{
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            Showing {tickets.length} records
          </span>

          <div className="pagination">
            <button className="pg-btn">Previous</button>
            <button className="pg-btn active">1</button>
            <button className="pg-btn">2</button>
            <button className="pg-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
