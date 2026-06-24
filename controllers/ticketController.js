const pool = require ("../db.js");

async function createTicket(req, res) {
    try {
        console.log("\n========== CREATE TICKET ==========");
        console.log("req.body =", req.body);
        console.log("req.user =", req.user);

        const user_id = req.user.user_id;
        const title = req.body.title;
        const departmentMap = {
    finance: "Finance",
    it_support: "IT Support",
    human_resources: "Human Resources",
    legal: "Legal",
    operations: "Operations"
};

const department_name =
    departmentMap[req.body.department_name] || req.body.department_name;
        const description = req.body.description;
        const response = req.body.expectedResponses || [];

        console.log("Department received:", department_name);
        console.log("Type:", typeof department_name);

        // Show every department currently in the database
        const [allDepartments] = await pool.query(
            "SELECT department_id, department_name FROM departments"
        );
        console.log("Departments in DB:", allDepartments);

        const [dept] = await pool.query(
            "SELECT department_id FROM departments WHERE department_name = ?",
            [department_name]
        );

        console.log("Department query result:", dept);

        if (dept.length === 0) {
            return res.status(404).json({
                message: "department not found",
                receivedDepartment: department_name
            });
        }

        const department_id = dept[0].department_id;

        const [result] = await pool.query(
            "INSERT INTO tickets(title, description, created_by, assigned_department) VALUES (?, ?, ?, ?)",
            [title, description, user_id, department_id]
        );

        console.log("Ticket inserted. ID:", result.insertId);

        for (const r of response) {
            await pool.query(
                "INSERT INTO expected_responses(ticket_id, response_text) VALUES (?, ?)",
                [result.insertId, r]
            );
        }

        console.log("Ticket created successfully.");

        res.json({
            success: true,
            message: "ticket created"
        });

    } catch (err) {
        console.log("========== CREATE TICKET ERROR ==========");
        console.log(err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

async function getTickets(req,res){

console.log(
"gettickets called"
);


const [rows] = await pool.query(` SELECT

t.ticket_id,

t.title,

d.department_name,

s.status_name,

t.created_at,

t.updated_at

FROM tickets t

JOIN departments d

ON
d.department_id=
t.assigned_department

LEFT JOIN status_master s

ON
s.status_id=
t.status_id

WHERE
t.created_by=?

ORDER BY
t.created_at DESC`,[req.user.user_id]);

res.json(rows);

}


async function getTicketDetail (req,res){

try{

const ticketId = req.params.id;

const userId = req.user.user_id;


const [rows] = await pool.query(
`SELECT

t.ticket_id,

t.title,

t.description,

t.created_at,

t.updated_at,

u.username,

d.department_name,

s.status_name


FROM tickets t


JOIN users u

ON
u.user_id=
t.created_by


JOIN departments d

ON
d.department_id=
t.assigned_department


JOIN status_master s

ON
s.status_id=
t.status_id


WHERE

t.ticket_id=?

AND

t.created_by=?

LIMIT 1
`,[ticketId,userId]);

if(rows.length===0){

return res.status(404).json({message:"Ticket not found"});

}

res.json(rows[0]);

}

catch(err){

console.log(err);

res.status(500).json({message:"Server error"});

}

}







module.exports={
    createTicket , getTickets , getTicketDetail
}