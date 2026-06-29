export default function Notifications({
  notificationList,
  setSelectedNotification,
  acknowledgeNotification,
  setShowForwardModal,
}) {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Notifications Received</div>

          <div className="page-sub">
            Incoming notifications from external users
          </div>
        </div>

        <button className="btn btn-primary">Mark All Read</button>
      </div>

      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <input
              className="search-input"
              placeholder="Search by ID, sender, subject..."
            />
          </div>

          <select className="filter-select">
            <option>All Statuses</option>
            <option>Unread</option>
            <option>Acknowledged</option>
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
                <th>Notification ID</th>
                <th>Sender</th>
                <th>Subject</th>
                <th>Date & Time</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {notificationList.map((n) => (
                <tr key={n.id}>
                  <td>
                    <span className="td-id">{n.id}</span>
                  </td>

                  <td>{n.sender}</td>

                  <td>{n.subject}</td>

                  <td>{n.datetime}</td>

                  <td>
                    <span
                      className={`badge ${
                        n.priority === "High"
                          ? "badge-high"
                          : n.priority === "Medium"
                            ? "badge-medium"
                            : "badge-low"
                      }`}
                    >
                      {n.priority}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        n.status === "Unread" ? "badge-unread" : "badge-ack"
                      }`}
                    >
                      {n.status}
                    </span>
                  </td>

                  <td>
                    <div className="action-cluster">
                      <button
                        className="btn-sm btn-sm-blue"
                        onClick={() => setSelectedNotification(n)}
                      >
                        View
                      </button>

                      <button
                        className="btn-sm btn-sm-green"
                        onClick={() => acknowledgeNotification(n.id)}
                      >
                        Ack
                      </button>

                      <button
                        className="btn-sm btn-sm-orange"
                        onClick={() => {
                          setSelectedNotification(n);
                          setShowForwardModal(true);
                        }}
                      >
                        Forward
                      </button>
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
            Showing {notificationList.length} records
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
