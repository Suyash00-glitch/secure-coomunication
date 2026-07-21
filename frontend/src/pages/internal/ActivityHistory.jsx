import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";
import { fmtDateTime } from "../../data/date";

const PAGE_SIZE = 10;

function itemLabel(a) {
  if (a.item_id === null || a.item_id === undefined) return "—";
  const padded = String(a.item_id).padStart(4, "0");
  const type = (a.item_type || "").toLowerCase();
  if (type === "ticket") return `TKT-${padded}`;
  if (type === "notification") return `NTF-${padded}`;
  if (type === "user") return `USR-${padded}`;
  return `#${padded}`;
}

export default function ActivityHistory() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search/date changes reset back to page 1 so filtered results always
  // start from the top rather than landing on a now out-of-range page.
  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate]);

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, startDate, endDate, page]);

  async function loadActivity() {
    setLoading(true);
    setLoadError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));

      const { res, data } = await apiJson(`/api/internal/activity?${params.toString()}`);
      if (res.ok) {
        setActivities(Array.isArray(data.activities) ? data.activities : []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      } else {
        setLoadError(data?.message || "Unable to load activity history.");
      }
    } catch (err) {
      console.log(err);
      setLoadError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  function goToPage(p) {
    if (p < 1 || p > pages) return;
    setPage(p);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Activity History</div>
          <div className="page-sub">Department audit trail</div>
        </div>
      </div>

      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <i className="ti ti-search"></i>
            <input
              className="search-input"
              placeholder="Search by action, item type, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <input
            type="date"
            className="filter-select"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="From date"
          />
          <input
            type="date"
            className="filter-select"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            aria-label="To date"
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Department</th>
                <th>Action</th>
                <th>Item Type</th>
                <th>Item ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                    Loading activity...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "#dc2626" }}>
                    {loadError}
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                    No activity found.
                  </td>
                </tr>
              ) : (
                activities.map((a) => (
                  <tr key={a.activity_id}>
                    <td>{fmtDateTime(a.created_at)}</td>
                    <td>{a.username || "—"}</td>
                    <td>{a.department_name || "—"}</td>
                    <td>{a.action}</td>
                    <td>{a.item_type || "—"}</td>
                    <td><span className="td-id">{itemLabel(a)}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pag-row">
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {loading ? "Loading..." : `Showing ${activities.length} of ${total} records`}
          </span>
          <div className="pagination">
            <button
              className="pg-btn"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>
            <button className="pg-btn active">{page}</button>
            <button
              className="pg-btn"
              onClick={() => goToPage(page + 1)}
              disabled={page >= pages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
