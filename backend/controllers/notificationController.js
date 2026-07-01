const pool = require ("../db.js");
const notification = require("../routes/notification.js");

async function createNotification(req,res) {
    const user_id = req.user.user_id;

    const title = req.body.title;

    const description = req.body.description;

    const [result] = await pool.query(`insert into notifications (title,description,created_by) values (?,?,?)`,[title,description,user_id]);
    
    const department_names = req.body.department_names;
    
    const notificationId = result.insertId;

for(const deptName of department_names){

const [rows] = await pool.query( `SELECT department_id FROM departments WHERE department_name=?`, [deptName] );

const departmentId = rows[0].department_id;

await pool.query(`INSERT INTO notification_master(notification_id,department_id) VALUES (?,?)`, [notificationId,departmentId]);

}

res.json({ message: "notification created" });
}

async function getNotifications (req,res){
   
    const [rows] =

await pool.query( `SELECT n.notification_id , n.title, u.username , n.created_at,

GROUP_CONCAT(d.department_name SEPARATOR ', ')

AS departments FROM notifications n JOIN users u

ON u.user_id = n.created_by

JOIN notification_master nm

ON nm.notification_id = n.notification_id

JOIN departments d ON d.department_id = nm.department_id

WHERE n.created_by = ?

GROUP BY n.notification_id

ORDER BY n.created_at DESC` , [req.user.user_id]);

res.json(rows);
}


async function getNotificationDetail (req,res){

try{

const notificationId = req.params.id;

const userId = req.user.user_id;



let query =
`

select

n.notification_id,

n.title,

n.description,

n.created_at,

u.username,

group_concat(d.department_name  separator ',')

as departments
from notifications n
join users u
on
u.user_id=
n.created_by
left join notification_master nm
on
nm.notification_id=
n.notification_id
left join departments d
on
d.department_id=
nm.department_id
where n.notification_id=?`;

let params = [notificationId];


if(req.user.role !=="admin"){

query += `and n.created_by=?`;
params.push(userId);
}


query +=

`group by

n.notification_id `;






const [rows] = await pool.query(query,params);


if(rows.length===0){

return res.status(404).json({message:"Notification not found"});

}


rows[0].departments = rows[0].departments.split(",");


res.json(rows[0]);

}

catch(err){

console.log(err);

res.status(500).json({message:
"Server error"});

}

}



async function getLatestNotifications(req, res) {

try{

const page = Number(req.query.page) || 1;

const limit = Number(req.query.limit) || 10;

const offset = (page - 1) * limit;

const [rows] = await pool.query(

`
SELECT
notification_id,
title,
created_at
FROM notifications
ORDER BY created_at DESC
LIMIT ?
OFFSET ?
`,

[limit, offset]

);

const [[count]] = await pool.query(

`SELECT COUNT(*) total FROM notifications`

);

res.json({

notifications: rows,

page,

total: count.total,

pages: Math.ceil(count.total / limit)

});

}

catch(err){

console.log(err);

res.status(500).json({message:"server error"});

}

}




async function getInternalNotificationDetail(req, res) {

try{

const notificationId = req.params.id;

const departmentId = req.user.department_id;

const [rows] = await pool.query(

`
SELECT

n.notification_id,
n.title,
n.description,
n.created_at,
n.is_acknowledged,
u.username AS created_by,
u.username AS created_by

FROM notifications n

JOIN notification_master nm
ON n.notification_id = nm.notification_id

LEFT JOIN users u
ON n.created_by = u.user_id

WHERE
n.notification_id = ?
AND
nm.department_id = ?
`,

[notificationId, departmentId]

);

if(rows.length === 0){

return res.status(404).json({
message:"Notification not found"
});

}

res.json(rows[0]);

}

catch(err){

res.status(500).json({
message:"Server error"
});

}

}






async function getInternalNotifications(req, res) {

try{

const departmentId = req.user.department_id;

const [rows] = await pool.query(

`
SELECT DISTINCT

n.notification_id,
n.title,
n.description,
n.created_at,
n.is_acknowledged,
u.username AS created_by

FROM notifications n

JOIN notification_master nm
ON n.notification_id = nm.notification_id

LEFT JOIN users u
ON n.created_by = u.user_id

WHERE nm.department_id = ?

ORDER BY n.created_at DESC
`,

[departmentId]

);

res.json(rows);

}

catch(err){

console.log(err);

res.status(500).json({
message:"Server error"
});

}

}


async function acknowledgeNotification(req, res) {

try{

const notificationId = req.params.id;

const departmentId = req.user.department_id;

const userId = req.user.user_id;

await pool.query(

`
UPDATE notifications n

JOIN notification_master nm
ON n.notification_id = nm.notification_id

SET

n.is_acknowledged = TRUE,

n.acknowledged_by = ?,

n.acknowledged_at = NOW()

WHERE

n.notification_id = ?

AND

nm.department_id = ?
`,

[userId, notificationId, departmentId]


);

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





module.exports = {
    createNotification , getNotifications , getNotificationDetail , 
    getLatestNotifications , getInternalNotificationDetail ,
     getInternalNotifications , acknowledgeNotification
}