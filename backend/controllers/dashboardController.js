const pool =require("../db.js");

async function getStats(req,res){
try{
const [users]=await pool.query(`select count(*) total from users where is_active = TRUE`);
const [departments]=await pool.query(`select count(*) total from departments`);
const [tickets]=await pool.query(`select count(*) total from tickets`);
const [open]=await pool.query(`select count(*) total from tickets where status_id=1`);
const [closed]=await pool.query(`select count(*) total from tickets where status_id=2`);
const [notifications]=await pool.query(`select count(*) total from notifications`);

res.json({
totalUsers:users[0].total,
totalDepartments:departments[0].total,
totalTickets:tickets[0].total,
openTickets:open[0].total,
closedTickets:closed[0].total,
totalNotifications:notifications[0].total
});
}
catch(err){
res.status(500).json({message:"server error"});
}
}

async function getDashboardStats(req, res) {
    try {
        const userId = req.user.user_id;

        const [[total]] = await pool.query(
            "SELECT COUNT(*) totalTickets FROM tickets WHERE created_by=?",
            [userId]
        );

        const [[open]] = await pool.query(
`SELECT COUNT(*) AS open
FROM tickets t
JOIN status_master sm ON t.status_id = sm.status_id
WHERE t.created_by = ? AND LOWER(sm.status_name) = 'open'`,
            [userId]
        );

        const [[underProcess]] = await pool.query(
`SELECT COUNT(*) AS underProcess
FROM tickets t
JOIN status_master sm ON t.status_id = sm.status_id
WHERE t.created_by = ? AND LOWER(sm.status_name) = 'unanswered'`,
            [userId]
        );

        const [[closed]] = await pool.query(
`SELECT COUNT(*) AS closed
FROM tickets t
JOIN status_master sm ON t.status_id = sm.status_id
WHERE t.created_by = ? AND LOWER(sm.status_name) = 'closed'`,
            [userId]
        );

        const [[notifications]] = await pool.query(
            "SELECT COUNT(*) notifications FROM notifications WHERE created_by=?",
            [userId]
        );

        res.json({
            totalTickets: total.totalTickets,
            open: open.open,
            underProcess: underProcess.underProcess,
            closed: closed.closed,
            notifications: notifications.notifications,
            priorityHigh: 0,
            priorityMedium: 0,
            priorityLow: 0,
            recentActivity: []
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
}

module.exports={getStats, getDashboardStats};
