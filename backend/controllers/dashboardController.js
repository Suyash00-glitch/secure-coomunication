const pool = require("../db.js");

// Admin dashboard
async function getStats(req, res) {
  try {
    const [[users]] = await pool.query(`SELECT COUNT(*) total FROM users WHERE is_active = TRUE`);
    const [[departments]] = await pool.query(`SELECT COUNT(*) total FROM departments`);
    const [[tickets]] = await pool.query(`SELECT COUNT(*) total FROM tickets`);
    const [[open]] = await pool.query(`SELECT COUNT(*) total FROM tickets WHERE status_id = 1`);
    const [[closed]] = await pool.query(`SELECT COUNT(*) total FROM tickets WHERE status_id = 2`);
    const [[unanswered]] = await pool.query(`SELECT COUNT(*) total FROM tickets WHERE status_id = 3`);
    const [[notifications]] = await pool.query(`SELECT COUNT(*) total FROM notifications`);

    // recent activity across all users
    const [recentActivity] = await pool.query(`
  SELECT al.action, al.item_type, al.item_id, al.created_at, u.username
  FROM activity_log al
  LEFT JOIN users u ON u.user_id = al.user_id
  ORDER BY al.created_at DESC
  LIMIT 5
`);

    // tickets by status for pie chart
    const [ticketsByStatus] = await pool.query(`
      SELECT sm.status_name, COUNT(*) as count
      FROM tickets t
      JOIN status_master sm ON t.status_id = sm.status_id
      GROUP BY sm.status_id, sm.status_name
    `);


   const [notificationRows] = await pool.query(`
SELECT
    n.notification_id,
    COUNT(DISTINCT nm.department_id) AS total_department_count,
    COALESCE(
        SUM(CASE WHEN nm.is_acknowledged = TRUE THEN 1 ELSE 0 END),
        0
    ) AS acknowledged_department_count
FROM notifications n
LEFT JOIN notification_master nm
ON nm.notification_id = n.notification_id
GROUP BY n.notification_id
`);

const counts = {
    "Unacknowledged": 0,
    "Partially Acknowledged": 0,
    "Fully Acknowledged": 0
};

notificationRows.forEach(r => {
    const total = Number(r.total_department_count) || 0;
    const acknowledged = Number(r.acknowledged_department_count) || 0;

    if (total > 0 && acknowledged >= total)
        counts["Fully Acknowledged"]++;
    else if (acknowledged > 0)
        counts["Partially Acknowledged"]++;
    else
        counts["Unacknowledged"]++;
});

const notifsByStatus = Object.entries(counts).map(([status_name, count]) => ({
    status_name,
    count
}));
    
    res.json({
  totalUsers: users.total,
  totalDepartments: departments.total,

  totalTickets: tickets.total,
  openTickets: open.total,
  closedTickets: closed.total,
  unansweredTickets: unanswered.total,

  totalNotifications: notifications.total,

  fullyAcknowledgedNotifications: counts["Fully Acknowledged"],
  partiallyAcknowledgedNotifications: counts["Partially Acknowledged"],
  unacknowledgedNotifications: counts["Unacknowledged"],

  ticketsByStatus,
  notifsByStatus,

  recentActivity: recentActivity.map(a => ({
    text: `<strong>${a.username}</strong> ${a.action} ${a.item_type} #${a.item_id}`,
    time: new Date(a.created_at).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    }),
    icon: a.item_type === "ticket" ? "ti-ticket" : "ti-bell"
  }))
});
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
}

// External dashboard
async function getDashboardStats(req, res) {
  try {
    const userId = req.user.user_id;

    const [[total]] = await pool.query(
      `SELECT COUNT(*) totalTickets FROM tickets WHERE created_by = ?`, [userId]
    );
    const [[open]] = await pool.query(
      `SELECT COUNT(*) AS open FROM tickets WHERE created_by = ? AND status_id = 1`, [userId]
    );
    const [[unanswered]] = await pool.query(
      `SELECT COUNT(*) AS unanswered FROM tickets WHERE created_by = ? AND status_id = 3`, [userId]
    );
    const [[closed]] = await pool.query(
      `SELECT COUNT(*) AS closed FROM tickets WHERE created_by = ? AND status_id = 2`, [userId]
    );
    const [[notifications]] = await pool.query(
      `SELECT COUNT(*) notifications FROM notifications WHERE created_by = ?`, [userId]
    );

    // recent activity for this user
   const [recentActivity] = await pool.query(`
  SELECT al.action, al.item_type, al.item_id, al.created_at, u.username
  FROM activity_log al
  LEFT JOIN users u ON u.user_id = al.user_id
  WHERE al.user_id = ?
  ORDER BY al.created_at DESC
  LIMIT 5
`, [userId]);

    // tickets by status for pie chart
    const [ticketsByStatus] = await pool.query(`
      SELECT sm.status_name, COUNT(*) as count
      FROM tickets t
      JOIN status_master sm ON t.status_id = sm.status_id
      WHERE t.created_by = ?
      GROUP BY sm.status_id, sm.status_name
    `, [userId]);


    const [notificationRows] = await pool.query(`
SELECT
    n.notification_id,
    COUNT(DISTINCT nm.department_id) AS total_department_count,
    COALESCE(
        SUM(CASE WHEN nm.is_acknowledged = TRUE THEN 1 ELSE 0 END),
        0
    ) AS acknowledged_department_count
FROM notifications n
LEFT JOIN notification_master nm
ON nm.notification_id = n.notification_id
WHERE n.created_by = ?
GROUP BY n.notification_id
`, [userId]);

const counts = {
    "Unacknowledged": 0,
    "Partially Acknowledged": 0,
    "Fully Acknowledged": 0
};

notificationRows.forEach(r => {
    const total = Number(r.total_department_count) || 0;
    const acknowledged = Number(r.acknowledged_department_count) || 0;

    if (total > 0 && acknowledged >= total)
        counts["Fully Acknowledged"]++;
    else if (acknowledged > 0)
        counts["Partially Acknowledged"]++;
    else
        counts["Unacknowledged"]++;
});

const notifsByStatus = Object.entries(counts).map(([status_name, count]) => ({
    status_name,
    count
}));
    res.json({
  totalTickets: total.totalTickets,
  open: open.open,
  underProcess: unanswered.unanswered,
  closed: closed.closed,

  notifications: notifications.notifications,

  acknowledgedNotifications: counts["Fully Acknowledged"],
  partiallyAcknowledgedNotifications: counts["Partially Acknowledged"],
  unacknowledgedNotifications: counts["Unacknowledged"],

  ticketsByStatus,
  notifsByStatus,

  recentActivity: recentActivity.map(a => ({
    text: `<strong>${a.username}</strong> ${a.action} ${a.item_type} #${a.item_id}`,
    time: new Date(a.created_at).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    }),
    icon: a.item_type === "ticket" ? "ti-ticket" : "ti-bell"
  }))
});

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

// Internal dashboard
async function getInternalStats(req, res) {
  try {
    const departmentId = req.user.department_id;

    const [[totalNotifs]] = await pool.query(
      `SELECT COUNT(*) total
       FROM notification_master
       WHERE department_id = ?`,
      [departmentId]
    );

    const [[unread]] = await pool.query(
      `SELECT COUNT(*) total
       FROM notification_master
       WHERE department_id = ?
       AND is_acknowledged = FALSE`,
      [departmentId]
    );

    const [[acknowledged]] = await pool.query(
      `SELECT COUNT(*) total
       FROM notification_master
       WHERE department_id = ?
       AND is_acknowledged = TRUE`,
      [departmentId]
    );

    const [[totalTickets]] = await pool.query(
      `SELECT COUNT(*) total
       FROM tickets
       WHERE assigned_department = ?`,
      [departmentId]
    );

    const [[openTickets]] = await pool.query(
      `SELECT COUNT(*) total
       FROM tickets
       WHERE assigned_department = ?
       AND status_id != 2
       AND assigned_to IS NULL`,
      [departmentId]
    );

    const [[beingHandled]] = await pool.query(
      `SELECT COUNT(*) total
       FROM tickets
       WHERE assigned_department = ?
       AND status_id != 2
       AND assigned_to IS NOT NULL`,
      [departmentId]
    );

    const [ticketsByStatus] = await pool.query(`
      SELECT
      CASE
          WHEN status_id = 2 THEN 'closed'
          WHEN assigned_to IS NOT NULL THEN 'being handled'
          ELSE 'open'
      END AS status_name,
      COUNT(*) AS count
      FROM tickets
      WHERE assigned_department = ?
      GROUP BY status_name
    `, [departmentId]);

    const [notifsByStatus] = await pool.query(`
      SELECT
      CASE
          WHEN is_acknowledged = TRUE THEN 'acknowledged'
          ELSE 'unacknowledged'
      END AS status_name,
      COUNT(*) AS count
      FROM notification_master
      WHERE department_id = ?
      GROUP BY is_acknowledged
    `, [departmentId]);

    res.json({
      totalTickets: totalTickets.total,
      openTickets: openTickets.total,
      beingHandledTickets: beingHandled.total,

      totalNotifications: totalNotifs.total,
      acknowledgedNotifications: acknowledged.total,
      unreadNotifications: unread.total,

      ticketsByStatus,
      notifsByStatus
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getStats, getDashboardStats, getInternalStats };