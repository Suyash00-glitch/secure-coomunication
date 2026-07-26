const pool = require ("../db.js");
const path = require("path");
const fs = require("fs");
const { logActivity } = require("../services/activityLogService.js");

/**
 * Admin/External rule mirrors getNotificationDetail(): Admin sees any
 * notification, External only ones they created themselves.
 */
function canAccessNotificationAsAdminOrExternal(user, notification) {
  if (user.role === "admin") {
    return true;
  }
  if (user.role === "outside") {
    return notification.created_by === user.user_id;
  }
  return false;
}

/**
 * Internal rule: a notification is visible to an Internal user only if it
 * was addressed to that user's department, i.e. a row exists in
 * notification_master for (notificationId, department_id). This is the
 * same scoping already used by getInternalNotifications() (the list view)
 * and acknowledgeNotification() — getInternalNotificationDetail() is fixed
 * below to use it too.
 */
async function isNotificationInDepartment(notificationId, departmentId) {
  const [rows] = await pool.query(
    `SELECT 1 FROM notification_master WHERE notification_id = ? AND department_id = ? LIMIT 1`,
    [notificationId, departmentId],
  );
  return rows.length > 0;
}

async function createNotification(req,res) {

    const user_id = req.user.user_id;
    const title = req.body.title;
    const description = req.body.description;
    const department_names = req.body.department_names;

    if(!title || !String(title).trim()){
        return res.status(400).json({message:"Title is required"});
    }
    if(!description || !String(description).trim()){
        return res.status(400).json({message:"Description is required"});
    }
    if(!Array.isArray(department_names) || department_names.length === 0){
        return res.status(400).json({message:"At least one department is required"});
    }

    const [result] = await pool.query(
        `INSERT INTO notifications(title,description,created_by)
         VALUES (?,?,?)`,
        [title, description, user_id]
    );

    const notificationId = result.insertId;

    const io = req.app.get("io");

    for(const deptName of department_names){

        const [rows] = await pool.query(
            `SELECT department_id
             FROM departments
             WHERE department_name = ?`,
            [deptName]
        );

        const departmentId = rows[0].department_id;

        await pool.query(
            `INSERT INTO notification_master
            (notification_id, department_id)
            VALUES (?, ?)`,
            [notificationId, departmentId]
        );

        console.log("department_names received:", department_names);
console.log("departmentId:", departmentId);

        io.to(`department-${departmentId}`).emit(
            "new-notification",
            {
                notification_id: notificationId
            }
        );

        console.log(`Emitting to department-${departmentId}`);
    }

    res.json({
        message: "notification created",
        notification_id: notificationId
    });
}



async function getNotifications(req,res){
    const [rows] = await pool.query(
`SELECT n.notification_id, n.title, u.username, n.created_at,
GROUP_CONCAT(d.department_name SEPARATOR ', ') AS departments
FROM notifications n JOIN users u ON u.user_id = n.created_by
JOIN notification_master nm ON nm.notification_id = n.notification_id
JOIN departments d ON d.department_id = nm.department_id
WHERE n.created_by = ?
GROUP BY n.notification_id
ORDER BY n.created_at DESC`, [req.user.user_id]);
    res.json(rows);
}

async function getNotificationDetail(req,res){

try{

const notificationId = req.params.id;
const userId = req.user.user_id;

let query = `
SELECT
n.notification_id,
n.title,
n.description,
n.created_at,
u.username,
GROUP_CONCAT(d.department_name SEPARATOR ',') AS departments

FROM notifications n

JOIN users u
ON u.user_id = n.created_by

LEFT JOIN notification_master nm
ON nm.notification_id = n.notification_id

LEFT JOIN departments d
ON d.department_id = nm.department_id

WHERE n.notification_id = ?
`;

let params = [notificationId];

if(req.user.role !== "admin"){

    query += ` AND n.created_by = ?`;

    params.push(userId);

}

query += ` GROUP BY n.notification_id`;

const [rows] = await pool.query(query, params);

if(rows.length === 0){

    return res.status(404).json({
        message:"Notification not found"
    });

}

rows[0].departments = rows[0].departments
    ? rows[0].departments.split(",")
    : [];

const [attachments] = await pool.query(

`
SELECT

attachment_id,
file_name,
file_location,
file_type

FROM notification_attachments

WHERE notification_id = ?

`,

[notificationId]

);


const [acknowledgedDepartments] = await pool.query(
`
SELECT
    d.department_name,
    ack.username AS acknowledged_by,
    nm.acknowledged_at

FROM notification_master nm

JOIN departments d
ON d.department_id = nm.department_id

LEFT JOIN users ack
ON ack.user_id = nm.acknowledged_by

WHERE nm.notification_id = ?
AND nm.is_acknowledged = TRUE
`,
[notificationId]
);


res.json({

    ...rows[0],

    attachments,

    acknowledged_departments: acknowledgedDepartments

});

}

catch(err){

console.log(err);

res.status(500).json({
message:"Server error"
});

}

}




async function getLatestNotifications(req, res) {
try{
const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const offset = (page - 1) * limit;
const [rows] = await pool.query(
`SELECT notification_id, title, created_at FROM notifications ORDER BY created_at DESC LIMIT ? OFFSET ?`,
[limit, offset]
);
const [[count]] = await pool.query(`SELECT COUNT(*) total FROM notifications`);
res.json({notifications: rows, page, total: count.total, pages: Math.ceil(count.total / limit)});
}
catch(err){
console.log(err);
res.status(500).json({message:"server error"});
}
}



async function getInternalNotificationDetail(req, res) {

    try {

        const notificationId = req.params.id;
        const departmentId = req.user.department_id;

        // Must be addressed to this Internal user's department — same rule
        // getInternalNotifications() already uses for the list view.
        // Checked before the row is even fetched so a valid-but-foreign
        // notification ID can't be distinguished from a nonexistent one.
        const authorized = await isNotificationInDepartment(notificationId, departmentId);
        if (!authorized) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        const [rows] = await pool.query(
            `
            SELECT
                n.notification_id,
                n.title,
                n.description,
                n.created_at,
                u.username AS created_by

            FROM notifications n

            LEFT JOIN users u
            ON u.user_id = n.created_by

            WHERE n.notification_id = ?
            `,
            [notificationId]
        );

        if (rows.length === 0) {

            return res.status(404).json({
                message: "Notification not found"
            });

        }

        const [attachments] = await pool.query(
            `
            SELECT
                attachment_id,
                file_name,
                file_location,
                file_type
            FROM notification_attachments
            WHERE notification_id = ?
            `,
            [notificationId]
        );

        const [acknowledgedDepartments] = await pool.query(`
  SELECT 
    d.department_name,
    u.username AS acknowledged_by,
    nm.acknowledged_at
  FROM notification_master nm
  JOIN departments d ON d.department_id = nm.department_id
  LEFT JOIN users u ON u.user_id = nm.acknowledged_by
  WHERE nm.notification_id = ?
  AND nm.is_acknowledged = TRUE
`, [notificationId]);
        

        await logActivity({
            user_id: req.user.user_id,
            department_id: departmentId,
            action: "Notification Viewed",
            item_type: "notification",
            item_id: notificationId,
        });

        res.json({

            ...rows[0],

            attachments,

            acknowledged_departments: acknowledgedDepartments

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server error"
        });

    }

}



async function getInternalNotifications(req, res) {
try{
const departmentId = req.user.department_id;
const [rows] = await pool.query(
`SELECT DISTINCT
n.notification_id,
n.title,
n.description,
n.created_at,
nm.is_acknowledged,
u.username AS created_by
FROM notifications n
JOIN notification_master nm
ON n.notification_id = nm.notification_id
LEFT JOIN users u
ON n.created_by = u.user_id
WHERE nm.department_id = ?
ORDER BY n.created_at DESC`,
[departmentId]
);
res.json(rows);
}
catch(err){
console.log(err);
res.status(500).json({message:"Server error"});
}
}




async function acknowledgeNotification(req, res) {

try{

const notificationId = req.params.id;
const departmentId = req.user.department_id;
const userId = req.user.user_id;

await pool.query(

`
UPDATE notification_master

SET
is_acknowledged = TRUE,
acknowledged_by = ?,
acknowledged_at = NOW()

WHERE notification_id = ?
AND department_id = ?
`,

[userId, notificationId, departmentId]

);

await logActivity({
    user_id: userId,
    department_id: departmentId,
    action: "Notification Acknowledged",
    item_type: "notification",
    item_id: notificationId,
});

res.json({
    message:"Notification acknowledged"
});

}

catch(err){

console.log(err);

res.status(500).json({
    message:"Server error"
});

}

}



async function uploadNotificationAttachment(req, res) {

    try {

        const { notificationId } = req.params;

        const file = req.file;

        if (!file) {

            return res.status(400).json({
                message: "No file uploaded"
            });

        }

        await pool.query(

            `
            INSERT INTO notification_attachments
            (
                notification_id,
                uploaded_by,
                file_name,
                file_location,
                file_type
            )
            VALUES (?,?,?,?,?)
            `,

            [
                notificationId,
                req.user.user_id,
                file.originalname,
                file.path,
                file.mimetype
            ]

        );

        res.json({
            message: "Attachment uploaded successfully"
        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({
            message: "Server error"
        });

    }

}






async function getAdminNotifications(req, res) {
try{
const [rows] = await pool.query(
`SELECT
n.notification_id,
n.title,
u.username AS created_by,
n.created_at,
GROUP_CONCAT(DISTINCT d.department_name SEPARATOR ', ') AS departments,
COUNT(DISTINCT nm.department_id) AS total_department_count,
COALESCE(SUM(CASE WHEN nm.is_acknowledged = TRUE THEN 1 ELSE 0 END), 0) AS acknowledged_department_count
FROM notifications n
LEFT JOIN users u ON u.user_id = n.created_by
LEFT JOIN notification_master nm ON nm.notification_id = n.notification_id
LEFT JOIN departments d ON d.department_id = nm.department_id
GROUP BY n.notification_id
ORDER BY n.created_at DESC`);

const result = rows.map(r => {
    const total = Number(r.total_department_count) || 0;
    const acknowledged = Number(r.acknowledged_department_count) || 0;

    // Derived, Admin-facing only — not a new DB status, and not stored
    // anywhere. A notification with zero recipient departments is not
    // "Fully Acknowledged" just because 0 === 0 — fall back to
    // Unacknowledged, matching the existing model's default state.
    let acknowledgement_status = "Unacknowledged";
    if (total > 0 && acknowledged > 0) {
        acknowledgement_status =
            acknowledged >= total ? "Fully Acknowledged" : "Partially Acknowledged";
    }

    return {
        notification_id: r.notification_id,
        title: r.title,
        created_by: r.created_by,
        created_at: r.created_at,
        departments: r.departments ? r.departments.split(", ") : [],
        total_department_count: total,
        acknowledged_department_count: acknowledged,
        acknowledgement_status,
    };
});

res.json(result);
}
catch(err){
console.log(err);
res.status(500).json({message:"Server error"});
}
}




/**
 * GET /api/notifications/:notificationId/attachments/:attachmentId/download
 *
 * Requires `auth` only (see routes/notification.js) — authorization varies
 * by role, enforced here rather than a single fixed role middleware. The
 * file path comes ONLY from the database row (file_location), never from
 * user input, and the attachment must belong to the exact notificationId
 * in the URL so a valid attachmentId can't be paired with an unrelated
 * notificationId to bypass authorization.
 */
async function downloadNotificationAttachment(req, res) {
  try {
    const { notificationId, attachmentId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        na.attachment_id,
        na.file_name,
        na.file_location,
        na.file_type,
        n.created_by
      FROM notification_attachments na
      JOIN notifications n ON n.notification_id = na.notification_id
      WHERE na.attachment_id = ? AND na.notification_id = ?
      `,
      [attachmentId, notificationId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    const attachment = rows[0];

    let authorized = canAccessNotificationAsAdminOrExternal(req.user, attachment);
    if (!authorized && req.user.role === "secure") {
      authorized = await isNotificationInDepartment(
        notificationId,
        req.user.department_id,
      );
    }

    if (!authorized) {
      return res.status(403).json({ message: "Access denied" });
    }

    const uploadsRoot = path.join(__dirname, "..", "uploads");
    const resolvedPath = path.resolve(
      path.join(__dirname, ".."),
      attachment.file_location,
    );

    // Defense in depth: even though file_location comes from our own DB
    // (never from the request), make sure it still resolves inside the
    // uploads directory before touching the filesystem.
    if (!resolvedPath.startsWith(uploadsRoot + path.sep)) {
      return res.status(400).json({ message: "Invalid attachment" });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: "File no longer exists" });
    }

    res.download(resolvedPath, attachment.file_name, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}





async function forwardNotification(req, res) {
  try {
    const notificationId = req.params.id;
    const departmentId = req.user.department_id;
    const userId = req.user.user_id;

   
    const [existing] = await pool.query(
      `SELECT is_acknowledged FROM notification_master 
       WHERE notification_id = ? AND department_id = ?`,
      [notificationId, departmentId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (!existing[0].is_acknowledged) {
      return res.status(403).json({ message: "You must acknowledge before forwarding" });
    }

    const { department_name } = req.body;

    
    const [dept] = await pool.query(
      `SELECT department_id FROM departments WHERE department_name = ?`,
      [department_name]
    );

    if (dept.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    const targetDeptId = dept[0].department_id;

    
    const [alreadySent] = await pool.query(
      `SELECT 1 FROM notification_master 
       WHERE notification_id = ? AND department_id = ?`,
      [notificationId, targetDeptId]
    );

    if (alreadySent.length > 0) {
      return res.status(400).json({ message: "Already sent to this department" });
    }

   
    await pool.query(
      `INSERT INTO notification_master (notification_id, department_id) VALUES (?, ?)`,
      [notificationId, targetDeptId]
    );

   
    const io = req.app.get("io");
    io.to(`department-${targetDeptId}`).emit("new-notification", {
      notification_id: notificationId
    });

    await logActivity({
      user_id: userId,
      department_id: departmentId,
      action: "Notification Forwarded",
      item_type: "notification",
      item_id: notificationId,
    });

    res.json({ message: "Notification forwarded successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}








module.exports = {
    createNotification, getNotifications, getNotificationDetail,
    getLatestNotifications, getInternalNotificationDetail,
    getInternalNotifications, acknowledgeNotification ,
     uploadNotificationAttachment, getAdminNotifications,
     downloadNotificationAttachment , forwardNotification
}
