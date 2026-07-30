import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";

function getStatsCards(profile) {
  const role = profile.role;
  const s = profile.stats || {};

  if (role === "admin") {
    return [
      { label: "Total Users", value: s.totalUsers ?? 0 },
      { label: "Total Departments", value: s.totalDepartments ?? 0 },
      { label: "Total Tickets", value: s.totalTickets ?? 0 },
      { label: "Total Notifications", value: s.totalNotifications ?? 0 },
    ];
  }

  if (role === "outside") {
    return [
      { label: "Tickets Created", value: s.tickets ?? 0 },
      { label: "Closed Tickets", value: s.closed ?? 0 },
      { label: "Notifications Sent", value: s.notifications ?? 0 },
      { label: "Fully Acknowledged Notifications", value: s.fullyAcknowledged ?? 0 },
    ];
  }

  // secure/internal
  return [
    { label: "Tickets Assigned", value: s.tickets ?? 0 },
    { label: "Notifications Assigned", value: s.notifications ?? 0 },
  ];
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const { res, data } = await apiJson("/api/profile");
      if (res.ok) setProfile(data);
    } catch (err) { console.log(err); }
  }

  function clearPasswordFields() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwSubmitting) return;
    setPwError("");
    setPwSuccess("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }

    setPwSubmitting(true);
    try {
      const { res, data } = await apiJson("/api/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      if (!res.ok) { setPwError(data.message || "Unable to change password."); return; }
      setPwSuccess(data.message || "Password changed successfully.");
      clearPasswordFields();
    } catch (err) {
      setPwError("Unable to connect to server.");
    } finally {
      setPwSubmitting(false);
    }
  }

  if (!profile) return <div className="page-header"><div><div className="page-title">Loading...</div></div></div>;

  const statsCards = getStatsCards(profile);

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
          {(profile.name || profile.username).charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{profile.name || profile.username}</div>
          <div className="profile-meta">{profile.department_name || "—"} · {profile.role}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Account Details</span></div>
          <div className="info-row"><span className="info-key">User ID</span><span>{profile.user_id}</span></div>
          <div className="info-row"><span className="info-key">Username</span><span>{profile.username}</span></div>
          <div className="info-row"><span className="info-key">Department</span><span>{profile.department_name || "—"}</span></div>
          <div className="info-row"><span className="info-key">Role</span><span>{profile.role}</span></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">My Stats</span></div>
          {statsCards.map((s, i) => (
            <div className="info-row" key={i}>
              <span className="info-key">{s.label}</span>
              <span>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card change-password-card">
        <div className="card-header"><span className="card-title">Change Password</span></div>
        <form onSubmit={handleChangePassword} className="change-password-form">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
          </div>
          {pwError && <div className="change-password-error">{pwError}</div>}
          {pwSuccess && <div className="change-password-success">{pwSuccess}</div>}
          <button className="btn btn-primary" type="submit" disabled={pwSubmitting}>
            {pwSubmitting ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}