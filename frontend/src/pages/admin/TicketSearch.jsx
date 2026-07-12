import { useState, useEffect, useMemo } from "react";
import { apiJson, downloadAttachment } from "../../api/client";

function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : ""; }
function fmtDateTime(d) { return d ? new Date(d).toLocaleString() : ""; }

function ticketIdLabel(t) {
  return t?.ticket_id ? `TKT-${String(t.ticket_id).padStart(4, "0")}` : "";
}

// Existing app convention (see internal/Tickets.jsx) maps status names to
// badge colors by substring rather than an exact hardcoded list, since the
// exact set of status_name values isn't hardcoded anywhere reliable in this
// codebase (see analysis) — this keeps working no matter what status names
// the backend actually returns.
function statusBadgeClass(statusName) {
  const s = (statusName || "").toLowerCase();
  if (s.includes("close")) return "badge-closed";
  if (s.includes("open")) return "badge-open";
  return "badge-process";
}

export default function TicketSearch() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  async function handleDownloadAttachment(file) {
    setDownloadError("");
    setDownloadingId(file.attachment_id);
    const result = await downloadAttachment(
      `/api/tickets/${detail.ticket_id}/attachments/${file.attachment_id}/download`,
      file.file_name,
    );
    if (!result.ok) setDownloadError(result.message);
    setDownloadingId(null);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    setLoadError("");
    try {
      const { res, data } = await apiJson("/api/admin/tickets");
      if (res.ok) {
        setTickets(Array.isArray(data) ? data : []);
      } else {
        setLoadError(data?.message || "Unable to load tickets.");
      }
    } catch (err) {
      console.log(err);
      setLoadError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  // Status filter options are derived from the actual data returned by the
  // API — not hardcoded — since the real set of status_name values isn't
  // reliably known from the codebase alone (see analysis).
  const statusOptions = useMemo(() => {
    const seen = new Map();
    for (const t of tickets) {
      const name = t?.status_name;
      if (!name) continue;
      const key = name.toLowerCase();
      if (!seen.has(key)) seen.set(key, name);
    }
    return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
  }, [tickets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesStatus =
        statusFilter === "all" ||
        (t.status_name || "").toLowerCase() === statusFilter;

      if (!matchesStatus) return false;
      if (!q) return true;

      const id = ticketIdLabel(t).toLowerCase();
      const ticketNumber = t.ticket_number ? String(t.ticket_number).toLowerCase() : "";
      const creator = (t.created_by || "").toLowerCase();
      const title = (t.title || "").toLowerCase();
      const dept = (t.department_name || "").toLowerCase();

      return (
        id.includes(q) ||
        ticketNumber.includes(q) ||
        creator.includes(q) ||
        title.includes(q) ||
        dept.includes(q)
      );
    });
  }, [tickets, search, statusFilter]);

  async function openTicket(ticketId) {
    setSelectedTicketId(ticketId);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const { res, data } = await apiJson(`/api/tickets/${ticketId}`);
      if (res.ok) {
        setDetail(data);
      } else {
        setDetailError(data?.message || "Ticket not found.");
      }
    } catch (err) {
      console.log(err);
      setDetailError("Unable to connect to server.");
    } finally {
      setDetailLoading(false);
    }
  }

  function backToList() {
    // Search/status filter state is intentionally left as-is so the list
    // reappears exactly as the Admin left it.
    setSelectedTicketId(null);
    setDetail(null);
    setDetailError("");
  }

  // ── Detail view ──────────────────────────────────────────────
  if (selectedTicketId) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">
              {detail ? `Ticket Detail — ${ticketIdLabel(detail)}` : "Ticket Detail"}
            </div>
            <div className="page-sub">
              {detail?.created_at ? `Submitted on ${fmtDate(detail.created_at)}` : ""}
            </div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={backToList}>
          <i className="ti ti-arrow-left"></i> Back to Tickets
        </button>

        {detailLoading && (
          <div className="card" style={{ marginTop: 16, textAlign: "center", padding: 40, color: "#6b7280" }}>
            Loading ticket...
          </div>
        )}

        {!detailLoading && detailError && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="not-found"><i className="ti ti-alert-triangle"></i>{detailError}</div>
          </div>
        )}

        {!detailLoading && detail && (
          <div className="detail-grid" style={{ marginTop: 16 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Ticket Information</span>
                {detail.status_name && <span className="badge">{detail.status_name}</span>}
              </div>
              <div className="info-row"><span className="info-key">Ticket ID</span><span>{ticketIdLabel(detail)}</span></div>
              <div className="info-row"><span className="info-key">Subject</span><span>{detail.title}</span></div>
              <div className="info-row"><span className="info-key">Department</span><span>{detail.department_name}</span></div>
              <div className="info-row"><span className="info-key">Created By</span><span>{detail.username}</span></div>
              <div className="info-row"><span className="info-key">Created Date</span><span>{fmtDateTime(detail.created_at)}</span></div>
              <div className="info-row"><span className="info-key">Last Updated</span><span>{fmtDateTime(detail.updated_at)}</span></div>
              {detail.description && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Description</div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151" }}>{detail.description}</p>
                </div>
              )}

              {detail.attachments?.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, fontWeight: 500 }}>
                    Attachments
                  </div>
                  {downloadError && (
                    <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>{downloadError}</div>
                  )}
                  {detail.attachments.map(file => (
                    <div
                      key={file.attachment_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                        padding: "10px 14px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        background: "#f9fafb"
                      }}
                    >
                      <i className="ti ti-paperclip"></i>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, color: "#111827" }}>{file.file_name}</div>
                        {file.file_type && <div style={{ fontSize: 11, color: "#9ca3af" }}>{file.file_type}</div>}
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleDownloadAttachment(file)}
                        disabled={downloadingId === file.attachment_id}
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <i className="ti ti-download"></i>
                        {downloadingId === file.attachment_id ? "Downloading..." : "Download"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {detail.conversation && detail.conversation.length > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-header">
                  <span className="card-title">Conversation</span>
                </div>
                {detail.conversation.map(msg => (
                  <div
                    key={msg.conversation_id}
                    className={msg.sender_type === "external" ? "chat-right" : "chat-left"}
                  >
                    <strong>{msg.username}</strong>
                    <p>{msg.message_text}</p>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Ticket Search</div>
          <div className="page-sub">Search and view all tickets</div>
        </div>
      </div>
      <div className="card">
        <div className="search-row">
          <div className="search-wrap">
            <input
              className="search-input"
              placeholder="Search by ticket ID, user, issue, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Created By</th>
                <th>Issue Title</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                    Loading tickets...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#dc2626" }}>
                    {loadError}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                    No tickets found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.ticket_id}>
                    <td><span className="td-id">{ticketIdLabel(t)}</span></td>
                    <td>{t.created_by || "—"}</td>
                    <td>{t.title}</td>
                    <td>{t.department_name || "—"}</td>
                    <td>
                      {t.status_name ? (
                        <span className={`badge ${statusBadgeClass(t.status_name)}`}>{t.status_name}</span>
                      ) : "—"}
                    </td>
                    <td>{fmtDateTime(t.updated_at || t.created_at)}</td>
                    <td>
                      <div className="action-cluster">
                        <button className="btn-sm btn-sm-blue" onClick={() => openTicket(t.ticket_id)}>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pag-row">
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {loading ? "Loading..." : `Showing ${filtered.length} of ${tickets.length} records`}
          </span>
          <div className="pagination">
            <button className="pg-btn">Previous</button>
            <button className="pg-btn active">1</button>
            <button className="pg-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
