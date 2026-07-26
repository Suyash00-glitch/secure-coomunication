import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";

/**
 * External/Admin Profile page.
 *
 * Mirrors the Internal Profile page's layout (profile-card header +
 * Account Details card) but:
 *   - fetches from the generic /api/profile endpoint (no role restriction,
 *     no department-scoped stats) instead of /api/internal/profile
 *   - does NOT include the Change Password section — that remains an
 *     Internal-only feature
 *   - adds the User Type (Local / LDAP) field
 */
export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const { res, data } = await apiJson("/api/profile");
      if (res.ok) setProfile(data);
    } catch (err) { console.log(err); }
  }

  if (!profile) return <div className="page-header"><div><div className="page-title">Loading...</div></div></div>;

  const userType = profile.auth_type === "ldap" ? "LDAP" : "Local";

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-sub">View account information</div>
        </div>
      </div>
      <div className="profile-card">
        <div className="profile-avatar">
          {profile.name ? profile.name.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{profile.name || profile.username}</div>
          <div className="profile-meta">
            {profile.department_name ? `${profile.department_name} · ` : ""}{profile.role}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Account Details</span></div>
        <div className="info-row"><span className="info-key">Username</span><span>{profile.username}</span></div>
        {profile.name && <div className="info-row"><span className="info-key">Full Name</span><span>{profile.name}</span></div>}
        <div className="info-row"><span className="info-key">Email</span><span>{profile.email || "—"}</span></div>
        {profile.department_name && <div className="info-row"><span className="info-key">Department</span><span>{profile.department_name}</span></div>}
        <div className="info-row"><span className="info-key">Role</span><span>{profile.role}</span></div>
        <div className="info-row"><span className="info-key">Status</span><span>{profile.is_active ? "Active" : "Inactive"}</span></div>
        <div className="info-row"><span className="info-key">User Type</span><span>{userType}</span></div>
      </div>
    </div>
  );
}
