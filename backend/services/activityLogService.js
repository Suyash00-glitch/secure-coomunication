const pool = require("../db.js");

/**
 * logActivity()
 *
 * Single reusable writer for the `activity_log` table. Every controller
 * that needs to record an Internal Portal action calls this instead of
 * writing its own INSERT, so the audit trail always has one shape.
 *
 * activity_log.department_id is NOT NULL (see schema), so any call missing
 * user_id / department_id / action is skipped rather than attempted — a
 * malformed or missing field here must never break the caller's real
 * request (login, ticket update, etc). Failures are logged and swallowed
 * for the same reason: activity logging is best-effort observability, not
 * something that should ever fail the user-facing action that triggered it.
 *
 * @param {Object} entry
 * @param {number} entry.user_id       - actor performing the action
 * @param {number} entry.department_id - department the action is scoped to
 * @param {string} entry.action        - short action label, e.g. "Login"
 * @param {string} [entry.item_type]   - e.g. "ticket", "notification", "user"
 * @param {number} [entry.item_id]     - id of the affected item, if any
 */
async function logActivity({ user_id, department_id, action, item_type = null, item_id = null }) {
  if (!user_id || !department_id || !action) {
    console.log("logActivity: skipped — missing required field(s)", {
      user_id,
      department_id,
      action,
    });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO activity_log (user_id, department_id, action, item_type, item_id)
       VALUES (?,?,?,?,?)`,
      [user_id, department_id, action, item_type, item_id],
    );
  } catch (err) {
    console.log("logActivity error:", err);
  }
}

module.exports = { logActivity };
