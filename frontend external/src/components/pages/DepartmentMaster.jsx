import { useState, useEffect } from "react";
import { apiJson } from "../../api/client";

function fmtDate(d) {
  return new Date(d).toLocaleDateString();
}

/**
 * Department Master — fetches departments from backend.
 * TODO: Confirm exact departments endpoint shape with backend.
 * Expected: GET /api/departments → [{ department_id, department_name, department_code, secure_area, status, created_at }]
 */
export default function DepartmentMaster() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // TODO: Replace with actual departments endpoint when available
        const { res, data } = await apiJson("/api/departments");
        if (res.ok) {
          setDepartments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className={true ? "page active" : "page"} id="page-dept-master">
      <div className="page-header">
        <div><div className="page-title">Department Master</div><div className="page-sub">Admin · Configure department settings and secure area flags</div></div>
        <button className="btn btn-primary" id="button-63"><i className="ti ti-plus"></i> Add Department</button>
      </div>
      <div className="card">
        <div className="search-row">
          <div className="search-wrap"><i className="ti ti-search"></i><input className="search-input" id="text-64" placeholder="Search departments…" type="text" /></div>
          <select className="filter-select" id="select-65" defaultValue="all_statuses">
            <option value="all_statuses">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="filter-select" id="select-66" defaultValue="secure_area_all">
            <option value="secure_area_all">Secure Area: All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <table>
          <thead><tr><th>#</th><th>Department Name</th><th>Department Code</th><th>Secure Area</th><th>Status</th><th>Created Date</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>Loading departments…</td></tr>
            ) : departments.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>No departments found</td></tr>
            ) : (
              departments.map((dept, idx) => (
                <tr key={dept.department_id || idx}>
                  <td>{String(idx + 1).padStart(2, "0")}</td>
                  <td>{dept.department_name}</td>
                  <td>{dept.department_code}</td>
                  <td>
                    <span className={dept.secure_area ? "badge badge-high" : "badge badge-low"}>
                      {dept.secure_area ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <span className={dept.status === "Active" ? "badge badge-active" : "badge badge-inactive"}>
                      {dept.status}
                    </span>
                  </td>
                  <td>{dept.created_at ? fmtDate(dept.created_at) : "-"}</td>
                  <td>
                    <button className="action-btn"><i className="ti ti-edit"></i> Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
