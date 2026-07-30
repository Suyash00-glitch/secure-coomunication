import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";
import Modal from "../../components/shared/Modal";

export default function DepartmentMaster() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
const pageSize = 10;

  useEffect(() => { loadDepartments(); }, []);
  useEffect(() => {
  setPage(1);
}, [search, statusFilter]);

  async function loadDepartments() {
    try {
      const { res, data } = await apiJson("/api/departments");
      if (res.ok) setDepartments(Array.isArray(data) ? data : []);
    } catch (err) { console.log(err); }
  }

  const filtered = departments.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.department_name.toLowerCase().includes(q) || String(d.department_id).includes(q);
    const matchStatus = statusFilter === "all_statuses" || d.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);

const paginatedDepartments = filtered.slice(
  (page - 1) * pageSize,
  page * pageSize
);

  async function addDepartment(name) {
    await apiJson("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department_name: name, secure_area_flag: false, status: "Active" })
    });
    loadDepartments();
  }

  async function editDepartment(id, name, setFormError) {
    const { res, data } = await apiJson(`/api/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department_name: name })
    });
    if (res.ok) {
      loadDepartments();
      setModal(null);
    } else {
      setFormError(data?.message || "Failed to update");
    }
  }

  async function deactivateDepartment(id) {
    setError("");
    const { res, data } = await apiJson(`/api/departments/${id}/deactivate`, { method: "PATCH" });
    if (res.ok) {
      setToast("Department deactivated");
      setTimeout(() => setToast(""), 3000);
      loadDepartments();
      setModal(null);
    } else {
      setError(data?.message || "Failed to deactivate");
    }
  }

  async function activateDepartment(id) {
    const { res } = await apiJson(`/api/departments/${id}/activate`, { method: "PATCH" });
    if (res.ok) {
      setToast("Department activated");
      setTimeout(() => setToast(""), 3000);
      loadDepartments();
    }
  }

  const isActive = (status) => status?.toLowerCase() === "active";

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

      {toast && <div className="toast">{toast}</div>}

      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <i className="ti ti-search"></i>
            <input className="search-input" placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all_statuses">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><i className="ti ti-building"></i><p>No departments found</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Department ID</th>
                <th>Department Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {paginatedDepartments.map(d => (
                <tr key={d.department_id}>
                  <td style={{ fontWeight: 600 }}>{d.department_id}</td>
                  <td>{d.department_name}</td>
                  <td>
                    <span className={`badge ${isActive(d.status) ? "badge-active" : "badge-inactive"}`}>
                      {isActive(d.status) ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="action-btn" onClick={() => { setError(""); setModal({ mode: "edit", dept: d }); }}>
                        Edit
                      </button>
                      {isActive(d.status) ? (
                        <button className="action-btn action-btn-danger" onClick={() => { setError(""); setModal({ mode: "deactivate", dept: d }); }}>
                          Deactivate
                        </button>
                      ) : (
                        <button className="action-btn" onClick={() => activateDepartment(d.department_id)}>
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

<div className="pag-row">
  <span style={{ fontSize: 12, color: "#6b7280" }}>
    {`Showing ${paginatedDepartments.length} of ${filtered.length} records`}
  </span>

  <div className="pagination">
    <button
      className="pg-btn"
      disabled={page === 1}
      onClick={() => setPage(page - 1)}
    >
      Previous
    </button>

    <button className="pg-btn active">
      {page}
    </button>

    <button
      className="pg-btn"
      disabled={page === totalPages || totalPages === 0}
      onClick={() => setPage(page + 1)}
    >
      Next
    </button>
  </div>
</div>


      </div>

      {modal === "add" && (
        <DeptFormModal
          title="Add Department"
          onClose={() => setModal(null)}
          onSubmit={(name) => { addDepartment(name); setModal(null); }}
        />
      )}

      {modal?.mode === "edit" && (
        <DeptFormModal
          title="Edit Department"
          initial={modal.dept}
          onClose={() => setModal(null)}
          onSubmit={(name, setFormError) => editDepartment(modal.dept.department_id, name, setFormError)}
        />
      )}

      {modal?.mode === "deactivate" && (
        <Modal
          title="Deactivate Department"
          onClose={() => { setModal(null); setError(""); }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setModal(null); setError(""); }}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deactivateDepartment(modal.dept.department_id)}>
                Deactivate
              </button>
            </>
          }
        >
          <p>Are you sure you want to deactivate <strong>{modal.dept.department_name}</strong>?</p>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>
            This will only work if there are no active users, open tickets, or unacknowledged notifications in this department.
          </p>
          {error && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13 }}>
              {error}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function DeptFormModal({ title, initial, onClose, onSubmit }) {
  const [name, setName] = useState(initial?.department_name || "");
  const [formError, setFormError] = useState("");

  function handleSubmit(e) {

    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
    setFormError("Department name is required");
    return;
  }
    onSubmit(name, setFormError);
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {initial ? "Update" : "Add"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-full">
          <label className="form-label">Department Name <span style={{ color: "#ef4444" }}>*</span></label>
          <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Finance" required />
        </div>
        {formError && (
          <div style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{formError}</div>
        )}
      </form>
    </Modal>
  );
}