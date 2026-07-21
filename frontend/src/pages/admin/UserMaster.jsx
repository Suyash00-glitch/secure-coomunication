import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";
import Modal from "../../components/shared/Modal";

// Matches the backend's format check in userController.js (createUser) —
// good enough to catch obvious typos before the request even goes out.
const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserMaster() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all_roles");
  const [deptFilter, setDeptFilter] = useState("all_departments");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [modal, setModal] = useState(null);

  // Add User submission state — kept here (rather than in the modal) so a
  // failed submit (e.g. duplicate username, invalid email) can show its
  // error without the modal being unmounted/reset.
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  // Post-creation notice (email sent / email failed) shown on the page
  // itself, since the modal is already closed by the time we know the
  // outcome of credential email delivery.
  const [notice, setNotice] = useState(null); // { type: "success" | "warning", message }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: u } = await apiJson("/api/users");
      setUsers(Array.isArray(u) ? u : []);
      const { data: d } = await apiJson("/api/departments");
      setDepartments(Array.isArray(d) ? d : []);
    } catch (err) {
      console.log(err);
    }
  }

  function getDeptName(id) {
    return (
      departments.find((d) => d.department_id === id)?.department_name || "-"
    );
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.username?.toLowerCase().includes(q) ||
      String(u.user_id).includes(q);
    const matchRole = roleFilter === "all_roles" || u.role === roleFilter;
    const matchDept =
      deptFilter === "all_departments" ||
      getDeptName(u.department_id) === deptFilter;
    const matchStatus =
      statusFilter === "all_statuses" ||
      (statusFilter === "Active" && u.is_active) ||
      (statusFilter === "Inactive" && !u.is_active);
    return matchSearch && matchRole && matchDept && matchStatus;
  });

  // Returns { ok, message, emailSent } rather than throwing, so the modal
  // can stay open and show a real error instead of silently failing.
  // `email` is sent to the backend ONLY to be used as the Nodemailer
  // recipient for this one request — it is not a users table column and
  // is never persisted.
  async function addUser(data) {
  try {
    const { res, data: respData } = await apiJson("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
        role: data.role,
        department_id: data.department_id,
        email: data.email,
        auth_type: data.auth_type,
        ldap_user_id: data.ldap_user_id,
      }),
    });
    if (res.ok) loadData();
    return { ok: res.ok, message: respData?.message, emailSent: respData?.emailSent };
  } catch (err) {
    return { ok: false, message: "Unable to connect to server." };
  }
}



  async function updateUser(id, data) {
    await apiJson(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    loadData();
  }

  async function deleteUser(id) {
    await apiJson(`/api/users/${id}/deactivate`, { method: "PATCH" });
    loadData();
  }

  async function handleAddUserSubmit(data) {
    if (addSubmitting) return; // guard against duplicate submissions

    setAddSubmitting(true);
    setAddError("");

    const result = await addUser(data);

    setAddSubmitting(false);

    if (!result.ok) {
      setAddError(result.message || "Unable to create user.");
      return; // keep the modal open so the admin can correct the input
    }

    setModal(null);
    setNotice({
      type: result.emailSent ? "success" : "warning",
      message:
        result.message ||
        (result.emailSent
          ? "User created successfully. Login credentials were sent to the user's email address."
          : "User was created successfully, but the credential email could not be delivered. Please verify the email address or email configuration."),
    });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">User Master</div>
          <div className="page-sub">Manage users</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setAddError("");
            setModal("add");
          }}
        >
          Add User
        </button>
      </div>

      {notice && (
        <div
          className={notice.type === "success" ? "alert alert-success" : "alert alert-warning"}
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: notice.type === "success" ? "#f0fdf4" : "#fffbeb",
            color: notice.type === "success" ? "#166534" : "#92400e",
            border: `1px solid ${notice.type === "success" ? "#bbf7d0" : "#fde68a"}`,
          }}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 16, lineHeight: 1 }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <div className="card">
        <div className="search-row">
          <input
            className="search-input"
            placeholder="Search username or id"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all_roles">All Roles</option>
            <option value="admin">admin</option>
            <option value="outside">outside</option>
            <option value="secure">secure</option>
          </select>
          <select
            className="filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="all_departments">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_name}>
                {d.department_name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all_statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.username}</td>
                <td>{getDeptName(u.department_id)}</td>
                <td>{u.role}</td>
                <td>
                  <span
                    className={`badge ${u.is_active ? "badge-active" : "badge-inactive"}`}
                  >
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="action-btn"
                      onClick={() => setModal({ mode: "edit", user: u })}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn action-btn-danger"
                      onClick={() => setModal({ mode: "delete", user: u })}
                    >
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === "add" && (
        <UserFormModal
          title="Add User"
          departments={departments}
          submitting={addSubmitting}
          error={addError}
          onClose={() => setModal(null)}
          onSubmit={handleAddUserSubmit}
        />
      )}
      {modal?.mode === "edit" && (
        <UserFormModal
          title="Edit User"
          departments={departments}
          initial={modal.user}
          onClose={() => setModal(null)}
          onSubmit={(data) => {
            updateUser(modal.user.user_id, data);
            setModal(null);
          }}
        />
      )}
      {modal?.mode === "delete" && (
        <Modal
          title="Deactivate User"
          onClose={() => setModal(null)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  deleteUser(modal.user.user_id);
                  setModal(null);
                }}
              >
                Deactivate
              </button>
            </>
          }
        >
          <p>
            Deactivate <strong>{modal.user.username}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}

function UserFormModal({ title, departments, initial, submitting, error, onClose, onSubmit }) {
  const [username, setUsername] = useState(initial?.username || "");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [department, setDepartment] = useState(initial?.department_id || "");
  const [role, setRole] = useState(initial?.role || "");
  const [status, setStatus] = useState(initial ? (initial.is_active ? "Active" : "Inactive") : "Active");
  const [authType, setAuthType] = useState(initial?.auth_type || "local");
  const [ldapUserId, setLdapUserId] = useState(initial?.ldap_user_id || "");

  const isSubmitting = !!submitting;
  const isLdap = authType === "ldap";

  function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!initial && !isLdap && !password.trim()) {
      alert("Please create a password for the new user.");
      return;
    }

    if (!initial) {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) { setEmailError("Email address is required."); return; }
      if (!EMAIL_FORMAT_REGEX.test(trimmedEmail)) { setEmailError("Enter a valid email address."); return; }
      setEmailError("");
    }

    onSubmit({
      username,
      password: password.trim(),
      email: email.trim(),
      department_id: Number(department),
      role,
      is_active: status === "Active",
      auth_type: authType,
      ldap_user_id: isLdap ? (ldapUserId.trim() || username) : null,
    });
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initial ? "Update" : "Add"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: "#dc2626", marginBottom: "12px", fontSize: "13px" }}>{error}</div>}

        <div className="form-full">
  <label className="form-label">Username</label>
  <input
    className="form-input"
    value={username}
    onChange={(e) => !initial && setUsername(e.target.value)}
    readOnly={!!initial}
    style={initial ? { background: "#f3f4f6", cursor: "not-allowed", color: "#6b7280" } : {}}
  />
</div>

        {!initial && (
          <div className="form-full">
            <label className="form-label">Authentication Type</label>
            <select className="form-select" value={authType} onChange={(e) => setAuthType(e.target.value)}>
              <option value="local">Local</option>
              <option value="ldap">LDAP</option>
            </select>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              {isLdap
                ? "User authenticates via LDAP/AD. No password stored."
                : "User authenticates with a locally stored password."}
            </div>
          </div>
        )}

        {!initial && (
          <div className="form-full">
            <label className="form-label">Create Password</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        )}

        {!initial && isLdap && (
          <div className="form-full">
            <label className="form-label">LDAP User ID</label>
            <input
              className="form-input"
              value={ldapUserId}
              placeholder={username || "e.g. john.doe"}
              onChange={(e) => setLdapUserId(e.target.value)}
            />
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Leave blank to use username as LDAP ID.
            </div>
          </div>
        )}

        {!initial && (
          <div className="form-full">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
              placeholder="user@example.com"
              required
            />
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Used once to send credentials. Not stored.</div>
            {emailError && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}>{emailError}</div>}
          </div>
        )}

        <div className="form-full">
          <label className="form-label">Department</label>
          <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">Select</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
            ))}
          </select>
        </div>

        <div className="form-full">
          <label className="form-label">Role</label>
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="outside">Outside</option>
            <option value="secure">Secure</option>
          </select>
        </div>

        <div className="form-full">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}