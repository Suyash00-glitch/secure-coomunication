import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";

/**
 * User Master — fetches users from backend.
 * TODO: Confirm exact users endpoint shape with backend.
 * Expected: GET /api/users → [{ username, full_name, email, login_type, role, department, status }]
 */
export default function UserMaster() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // TODO: Replace with actual users endpoint when available
        const { res, data } = await apiJson("/api/users");
        if (res.ok) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function roleBadge(role) {
    switch (role) {
      case "Admin": return "badge badge-admin";
      case "Internal User": return "badge badge-open";
      case "External User": return "badge badge-process";
      default: return "badge";
    }
  }

  function loginBadge(type) {
    return type === "LDAP" ? "badge badge-ldap" : "badge badge-local";
  }

  function statusBadge(status) {
    return status === "Active" ? "badge badge-active" : "badge badge-inactive";
  }

  return (
    <div className={true ? "page active" : "page"} id="page-user-master">
      <div className="page-header">
        <div><div className="page-title">User Master</div><div className="page-sub">Admin · Manage system users and access roles</div></div>
        <button className="btn btn-primary" id="button-48"><i className="ti ti-plus"></i> Add User</button>
      </div>
      <div className="card">
        <div className="search-row">
          <div className="search-wrap"><i className="ti ti-search"></i><input className="search-input" id="text-49" placeholder="Search by name, username, email…" type="text" /></div>
          <select className="filter-select" id="select-50" defaultValue="all_roles">
            <option value="all_roles">All Roles</option>
            <option value="admin">Admin</option>
            <option value="external_user">External User</option>
            <option value="internal_user">Internal User</option>
          </select>
          <select className="filter-select" id="select-51" defaultValue="all_departments">
            <option value="all_departments">All Departments</option>
            <option value="finance">Finance</option>
            <option value="it_support">IT Support</option>
            <option value="hr">HR</option>
          </select>
          <select className="filter-select" id="select-52" defaultValue="all_statuses">
            <option value="all_statuses">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <table>
          <thead><tr><th>Username</th><th>Full Name</th><th>Email</th><th>Login Type</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>Loading users…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>No users found</td></tr>
            ) : (
              users.map((u, idx) => (
                <tr key={u.username || idx}>
                  <td>{u.username}</td>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td><span className={loginBadge(u.login_type)}>{u.login_type}</span></td>
                  <td><span className={roleBadge(u.role)}>{u.role}</span></td>
                  <td>{u.department}</td>
                  <td><span className={statusBadge(u.status)}>{u.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="action-btn"><i className="ti ti-edit"></i></button>
                      <button className="action-btn action-btn-danger"><i className="ti ti-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div style={{ marginTop: 14, fontSize: 12, color: "#6b7280" }}>
          {loading ? "Loading…" : `Showing ${users.length} users`}
        </div>
      </div>
    </div>
  );
}
