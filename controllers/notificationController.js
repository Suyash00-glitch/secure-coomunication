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


const [rows] = await pool.query(

`
SELECT

n.notification_id,

n.title,

n.description,

n.created_at,

u.username,


GROUP_CONCAT(

d.department_name

SEPARATOR ',')

AS departments


FROM notifications n


JOIN users u

ON
u.user_id=
n.created_by

JOIN notification_master nm

ON
nm.notification_id=
n.notification_id

JOIN departments d

ON
d.department_id=
nm.department_id

WHERE

n.notification_id=?

AND

n.created_by=?

GROUP BY
n.notification_id `, [notificationId,userId]

);


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



module.exports = {
    createNotification , getNotifications , getNotificationDetail
}