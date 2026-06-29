import { useState } from "react";
import Modal from "../components/Modal.jsx";

export default function DepartmentMaster({ departments, users, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [modal, setModal] = useState(null);

  const deptWithCounts = departments.map(d => ({
    ...d,
    userCount: users.filter(u => Number(u.department_id) === Number(d.department_id)).length,
  }));

  const filtered = deptWithCounts.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.department_name.toLowerCase().includes(q) || String(d.department_id).toLowerCase().includes(q);
    const matchStatus = statusFilter === "all_statuses" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function openAdd() { setModal("add"); }

  function openEdit(user) {
  console.log("EDIT",user);

  setModal({mode:"edit",user});
}
  function openDelete(dept) { setModal({ mode: "delete", dept }); }
  function closeModal() { setModal(null); }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Department Master</div>
          <div className="page-sub">Manage departments and their configurations</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="ti ti-plus"></i> Add Department
        </button>
      </div>

      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <i className="ti ti-search"></i>
            <input
              className="search-input"
              placeholder="Search departments..."
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all_statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-building"></i>
            <p>No departments found</p>
            <span className="empty-sub">Try adjusting your search or filters</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Department ID</th>
                <th>Department Name</th>
                <th>Head</th>
                <th>Number of Users</th>
                <th>Secure Area</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.department_id}>
                  <td style={{ fontWeight: 600 }}>{d.department_id}</td>
                  <td>{d.department_name}</td>
                  <td>{d.head || "—"}</td>
                  <td>{d.userCount}</td>
                  <td>
  <span
    className={`badge ${
      Number(d.secure_area_flag) === 1
        ? "badge-danger"
        : "badge-active"
    }`}
  >
    {Number(d.secure_area_flag) === 1 ? "Yes" : "No"}
  </span>
</td>
                  <td>
                    <span className={`badge ${d.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="action-btn" onClick={() => openEdit(d)}><i className="ti ti-edit"></i></button>
                      <button className="action-btn action-btn-danger" onClick={() => openDelete(d)}><i className="ti ti-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === "add" && (
        <DeptFormModal
          title="Add Department"
          onClose={closeModal}
          onSubmit={data => { onAdd(data); closeModal(); }}
        />
      )}
      {modal?.mode === "edit" && (
        <DeptFormModal
          title="Edit Department"
          initial={modal.dept}
          onClose={closeModal}
          onSubmit={data => { onUpdate(modal.dept.department_id, data); closeModal(); }}
        />
      )}
      {modal?.mode === "delete" && (
        <Modal
          title="Delete Department"
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { onDelete(modal.dept.department_id); closeModal(); }}>
                <i className="ti ti-trash"></i> Delete
              </button>
            </>
          }
        >
          <p className="confirm-text">
            Are you sure you want to delete department <strong>{modal.dept.name}</strong>? This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

function DeptFormModal({ title, initial, onClose, onSubmit }) {
  const [name, setName] = useState(initial?.name || "");
  const [head, setHead] = useState(initial?.head || "");
  const [status, setStatus] = useState(initial?.status || "Active");

  const [secureArea, setSecureArea] = useState(
  initial?.secure_area_flag ?? 0
  );

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
  name,
  head,
  status,
  secure_area_flag: secureArea
});
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <i className="ti ti-check"></i> {initial ? "Update" : "Add"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-full">
          <label className="form-label">Department Name <span style={{ color: "#ef4444" }}>*</span></label>
          <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Finance" required />
        </div>
        <div className="form-full">
          <label className="form-label">Head</label>
          <input className="form-input" type="text" value={head} onChange={e => setHead(e.target.value)} placeholder="Department head name" />
        </div>
        <div className="form-full">
          <label className="form-label">Secure Area</label>

  <select
    className="form-select"
    value={secureArea}
    onChange={e => setSecureArea(Number(e.target.value))}
  >
    <option value={0}>No</option>
    <option value={1}>Yes</option>
  </select>
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
