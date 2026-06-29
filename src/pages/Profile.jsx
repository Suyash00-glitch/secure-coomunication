export default function Profile() {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">My Profile</div>

          <div className="page-sub">View and manage account information</div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">PS</div>

        <div style={{ flex: 1 }}>
          <div className="profile-name">Priya Sharma</div>

          <div className="profile-meta">
            IT Support Department · Internal Staff
          </div>

          <div className="profile-meta" style={{ marginTop: "6px" }}>
            p.sharma@dept.gov
          </div>
        </div>

        <button className="btn btn-primary">Edit Profile</button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <div className="card">
          <div className="card-header">
            <span className="card-title">Account Details</span>
          </div>

          <div className="info-row">
            <span className="info-key">Staff ID</span>
            <span>STF-0024</span>
          </div>

          <div className="info-row">
            <span className="info-key">Username</span>
            <span>priya.sharma</span>
          </div>

          <div className="info-row">
            <span className="info-key">Department</span>
            <span>IT Support</span>
          </div>

          <div className="info-row">
            <span className="info-key">Role</span>
            <span>Internal Staff</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">My Stats</span>
          </div>

          <div className="info-row">
            <span className="info-key">Notifications Received</span>
            <span>5</span>
          </div>

          <div className="info-row">
            <span className="info-key">Tickets Managed</span>
            <span>5</span>
          </div>

          <div className="info-row">
            <span className="info-key">Pending Actions</span>
            <span>4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
