import { useState } from "react";





export default function Notifications({
  notificationList,
  setSelectedNotification,
  acknowledgeNotification,
  setShowForwardModal,
}) {

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  

  const filteredNotifications = notificationList.filter((n) => {

  const matchSearch = search === "" ||
    n.id.toLowerCase().includes(search.toLowerCase());

  const matchStatus =  statusFilter === "All" ||
    n.status === statusFilter;

  return matchSearch && matchStatus;

});
  
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Notifications Received</div>

          <div className="page-sub">
            Incoming notifications from external users
          </div>
        </div>

        
      </div>

      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <input
  className="search-input"
  placeholder="Search Notification ID..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
          </div>

          <select
  className="filter-select"
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="All">All</option>
  <option value="Acknowledged">Acknowledged</option>
  <option value="Unacknowledged">Unacknowledged</option>
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
  
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredNotifications.map((n) => (
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
    n.status === "Acknowledged"
      ? "badge-ack"
      : "badge-unread"
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

                   {n.status === "Unacknowledged" && (
  <button
    className="btn-sm btn-sm-green"
    onClick={() => acknowledgeNotification(n.notification_id)}
  >
    Acknowledge
  </button>
)}

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
            Showing {filteredNotifications.length} records
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
