import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";
import Modal from "../../components/shared/Modal";

export default function UserMaster() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all_roles");
  const [deptFilter, setDeptFilter] = useState("all_departments");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: u } = await apiJson("/api/users");
      setUsers(Array.isArray(u) ? u : []);
      const { data: d } = await apiJson("/api/departments");
      setDepartments(Array.isArray(d) ? d : []);
    } catch (err) { console.log(err); }
  }

  function getDeptName(id) {
    return departments.find(d => d.department_id === id)?.department_name || "-";
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.username?.toLowerCase().includes(q) || String(u.user_id).includes(q);
    const matchRole = roleFilter === "all_roles" || u.role === roleFilter;
    const matchDept = deptFilter === "all_departments" || getDeptName(u.department_id) === deptFilter;
    const matchStatus = statusFilter === "all_statuses" ||
      (statusFilter === "Active" && u.is_active) ||
      (statusFilter === "Inactive" && !u.is_active);
    return matchSearch && matchRole && matchDept && matchStatus;
  });

  async function addUser(data) {
    await apiJson("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: data.username, role: data.role, department_id: data.department_id })
    });
    loadData();
  }

  async function updateUser(id, data) {
    await apiJson(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    loadData();
  }

  async function deleteUser(id) {
    await apiJson(`/api/users/${id}/deactivate`, { method: "PATCH" });
    loadData();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">User Master</div>
          <div className="page-sub">Manage users</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("add")}>Add User</button>
      </div>
      <div className="card">
        <div className="search-row">
          <input className="search-input" placeholder="Search username or id" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all_roles">All Roles</option>
            <option value="admin">admin</option>
            <option value="outside">outside</option>
            <option value="secure">secure</option>
          </select>
          <select className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="all_departments">All Departments</option>
            {departments.map(d => <option key={d.department_id} value={d.department_name}>{d.department_name}</option>)}
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all_statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <table>
          <thead><tr><th>ID</th><th>Username</th><th>Department</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.username}</td>
                <td>{getDeptName(u.department_id)}</td>
                <td>{u.role}</td>
                <td><span className={`badge ${u.is_active ? "badge-active" : "badge-inactive"}`}>{u.is_active ? "Active" : "Inactive"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="action-btn" onClick={() => setModal({ mode: "edit", user: u })}>Edit</button>
                    <button className="action-btn action-btn-danger" onClick={() => setModal({ mode: "delete", user: u })}>Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === "add" && (
        <UserFormModal title="Add User" departments={departments} onClose={() => setModal(null)}
          onSubmit={(data) => { addUser(data); setModal(null); }} />
      )}
      {modal?.mode === "edit" && (
        <UserFormModal title="Edit User" departments={departments} initial={modal.user} onClose={() => setModal(null)}
          onSubmit={(data) => { updateUser(modal.user.user_id, data); setModal(null); }} />
      )}
      {modal?.mode === "delete" && (
        <Modal title="Deactivate User" onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => { deleteUser(modal.user.user_id); setModal(null); }}>Deactivate</button>
          </>}>
          <p>Deactivate <strong>{modal.user.username}</strong>?</p>
        </Modal>
      )}
    </div>
  );
}

function UserFormModal({ title, departments, initial, onClose, onSubmit }) {
  const [username, setUsername] = useState(initial?.username || "");
  const [department, setDepartment] = useState(initial?.department_id || "");
  const [role, setRole] = useState(initial?.role || "");
  const [status, setStatus] = useState(initial ? (initial.is_active ? "Active" : "Inactive") : "Active");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ username, department_id: Number(department), role, is_active: status === "Active" });
  }

  return (
    <Modal title={title} onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>{initial ? "Update" : "Add"}</button>
      </>}>
      <form onSubmit={handleSubmit}>
        <div className="form-full"><label className="form-label">Username</label><input className="form-input" value={username} onChange={e => setUsername(e.target.value)} /></div>
        <div className="form-full"><label className="form-label">Department</label>
          <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">Select</option>
            {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
          </select>
        </div>
        <div className="form-full"><label className="form-label">Role</label>
          <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="outside">Outside</option>
            <option value="secure">Secure</option>
          </select>
        </div>
        <div className="form-full"><label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
