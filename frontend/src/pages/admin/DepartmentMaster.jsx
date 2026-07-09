import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";
import Modal from "../../components/shared/Modal";

export default function DepartmentMaster() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [modal, setModal] = useState(null);

  useEffect(() => { loadDepartments(); }, []);

  async function loadDepartments() {
    try {
      const { res, data } = await apiJson("/api/departments");
      if (res.ok) setDepartments(Array.isArray(data) ? data : []);
    } catch (err) { console.log(err); }
  }

  const filtered = departments.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.department_name.toLowerCase().includes(q) || String(d.department_id).toLowerCase().includes(q);
    const matchStatus = statusFilter === "all_statuses" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function addDepartment(data) {
    await apiJson("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department_name: data.name, secure_area_flag: false, status: data.status.toUpperCase() })
    });
    loadDepartments();
  }

  function updateDepartment(id, data) {
    setDepartments(prev => prev.map(d => d.department_id === id ? { ...d, ...data } : d));
  }

  function deleteDepartment(id) {
    setDepartments(prev => prev.filter(d => d.department_id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Department Master</div>
          <div className="page-sub">Manage departments and their configurations</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("add")}>
          <i className="ti ti-plus"></i> Add Department
        </button>
      </div>
      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <i className="ti ti-search"></i>
            <input className="search-input" placeholder="Search departments..." type="text" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all_statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><i className="ti ti-building"></i><p>No departments found</p></div>
        ) : (
          <table>
            <thead><tr><th>Department ID</th><th>Department Name</th><th>Head</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.department_id}>
                  <td style={{ fontWeight: 600 }}>{d.department_id}</td>
                  <td>{d.department_name}</td>
                  <td>{d.head || "—"}</td>
                  <td><span className={`badge ${d.status === "Active" ? "badge-active" : "badge-inactive"}`}>{d.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="action-btn" onClick={() => setModal({ mode: "edit", dept: d })}><i className="ti ti-edit"></i></button>
                      <button className="action-btn action-btn-danger" onClick={() => setModal({ mode: "delete", dept: d })}><i className="ti ti-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === "add" && (
        <DeptFormModal title="Add Department" onClose={() => setModal(null)}
          onSubmit={data => { addDepartment(data); setModal(null); }} />
      )}
      {modal?.mode === "edit" && (
        <DeptFormModal title="Edit Department" initial={modal.dept} onClose={() => setModal(null)}
          onSubmit={data => { updateDepartment(modal.dept.department_id, data); setModal(null); }} />
      )}
      {modal?.mode === "delete" && (
        <Modal title="Delete Department" onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => { deleteDepartment(modal.dept.department_id); setModal(null); }}><i className="ti ti-trash"></i> Delete</button>
          </>}>
          <p className="confirm-text">Are you sure you want to delete department <strong>{modal.dept.department_name}</strong>?</p>
        </Modal>
      )}
    </div>
  );
}

function DeptFormModal({ title, initial, onClose, onSubmit }) {
  const [name, setName] = useState(initial?.department_name || initial?.name || "");
  const [head, setHead] = useState(initial?.head || "");
  const [status, setStatus] = useState(initial?.status || "Active");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name, head, status });
  }

  return (
    <Modal title={title} onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}><i className="ti ti-check"></i> {initial ? "Update" : "Add"}</button>
      </>}>
      <form onSubmit={handleSubmit}>
        <div className="form-full"><label className="form-label">Department Name <span style={{ color: "#ef4444" }}>*</span></label><input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Finance" required /></div>
        <div className="form-full"><label className="form-label">Head</label><input className="form-input" type="text" value={head} onChange={e => setHead(e.target.value)} placeholder="Department head name" /></div>
        <div className="form-full"><label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
