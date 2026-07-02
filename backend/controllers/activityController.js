const pool =require("../db.js");

async function getActivityHistory(req, res) {
try{
const departmentId = req.user.department_id;
const [rows] = await pool.query(
`
SELECT
FROM (
SELECT
'notification' AS type,
n.notification_id AS item_id,
'Acknowledged' AS action,
u.username AS performed_by,
n.acknowledged_at AS performed_at
FROM notifications n
JOIN notification_master nm
ON n.notification_id = nm.notification_id
LEFT JOIN users u
ON n.acknowledged_by = u.user_id
WHERE
nm.department_id = ?
AND
n.is_acknowledged = TRUE

UNION ALL

SELECT
'ticket' AS type,
t.ticket_id AS item_id,
'Acknowledged' AS action,
u.username AS performed_by,
t.acknowledgement_at AS performed_at
FROM tickets t
LEFT JOIN users u
ON t.acknowledged_by = u.user_id
WHERE
t.assigned_department = ?
AND
t.acknowledgement_at IS NOT NULL

UNION ALL

SELECT
'ticket' AS type,
trh.ticket_id AS item_id,
'Response Sent' AS action,
u.username AS performed_by,
trh.created_at AS performed_at
FROM ticket_response_history trh
JOIN tickets t
ON trh.ticket_id = t.ticket_id
LEFT JOIN users u
ON trh.responded_by = u.user_id
WHERE
t.assigned_department = ?

UNION ALL

SELECT
'ticket' AS type,
t.ticket_id AS item_id,
'Closed' AS action,
u.username AS performed_by,
t.closed_at AS performed_at
FROM tickets t
LEFT JOIN users u
ON t.closed_by = u.user_id
WHERE
t.assigned_department = ?
AND
t.closed_at IS NOT NULL
) activity
ORDER BY performed_at DESC
`,
[departmentId,departmentId,departmentId,departmentId]
);
res.json(rows);
}
catch(err){
console.log(err);
res.status(500).json({message:"Server error"});
}
}

module.exports = {getActivityHistory}
