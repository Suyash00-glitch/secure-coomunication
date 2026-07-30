const pool = require("../db.js");

/**
 * GET /api/internal/activity
 *
 * Reads directly from `activity_log` (populated by services/activityLogService.js
 * across the app) and is scoped to the requesting Internal user's own
 * department, same as the previous implementation.
 *
 * Query params (all optional):
 *   search    - matches against action, item type, or username
 *   startDate - YYYY-MM-DD, inclusive lower bound on created_at
 *   endDate   - YYYY-MM-DD, inclusive upper bound on created_at
 *   page      - 1-based page number (default 1)
 *   limit     - rows per page (default 10)
 */
async function getActivityHistory(req, res) {
  try {


    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;

    const search = (req.query.search || "").trim();
    const startDate = (req.query.startDate || "").trim();
    const endDate = (req.query.endDate || "").trim();

    const whereClauses = [];
const params = [];

if (req.user.role === "outside") {
    whereClauses.push("al.user_id = ?");
    params.push(req.user.user_id);
}
else if (req.user.role === "secure") {
    whereClauses.push("al.department_id = ?");
    params.push(req.user.department_id);
}
    

    if (search) {
      whereClauses.push(
        "(al.action LIKE ? OR al.item_type LIKE ? OR u.username LIKE ?)",
      );
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    if (startDate) {
      whereClauses.push("al.created_at >= ?");
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      whereClauses.push("al.created_at <= ?");
      params.push(`${endDate} 23:59:59`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT
        al.activity_id,
        al.action,
        al.item_type,
        al.item_id,
        al.created_at,
        u.username,
        d.department_name
      FROM activity_log al
      LEFT JOIN users u ON u.user_id = al.user_id
      LEFT JOIN departments d ON d.department_id = al.department_id
      ${whereSql}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    const [[count]] = await pool.query(
      `
      SELECT COUNT(*) total
      FROM activity_log al
      LEFT JOIN users u ON u.user_id = al.user_id
      LEFT JOIN departments d ON d.department_id = al.department_id
      ${whereSql}
      `,
      params,
    );

    res.json({
      activities: rows,
      page,
      limit,
      total: count.total,
      pages: Math.ceil(count.total / limit) || 1,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getActivityHistory };
