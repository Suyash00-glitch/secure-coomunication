import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const { res, data } = await apiJson("/api/internal/profile");
      if (res.ok) setProfile(data);
    } catch (err) { console.log(err); }
  }

  if (!profile) return <div className="page-header"><div><div className="page-title">Loading...</div></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-sub">View and manage account information</div>
        </div>
      </div>
      <div className="profile-card">
        <div className="profile-avatar">
          {profile.name ? profile.name.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{profile.name || profile.username}</div>
          <div className="profile-meta">{profile.department_name} · {profile.role}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Account Details</span></div>
          <div className="info-row"><span className="info-key">Staff ID</span><span>{profile.user_id}</span></div>
          <div className="info-row"><span className="info-key">Username</span><span>{profile.username}</span></div>
          <div className="info-row"><span className="info-key">Department</span><span>{profile.department_name}</span></div>
          <div className="info-row"><span className="info-key">Role</span><span>{profile.role}</span></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">My Stats</span></div>
          <div className="info-row"><span className="info-key">Notifications Assigned</span><span>{profile.stats.notifications}</span></div>
          <div className="info-row"><span className="info-key">Tickets Assigned</span><span>{profile.stats.tickets}</span></div>
          <div className="info-row"><span className="info-key">Pending Tickets</span><span>{profile.stats.pending}</span></div>
        </div>
      </div>
    </div>
  );
}
