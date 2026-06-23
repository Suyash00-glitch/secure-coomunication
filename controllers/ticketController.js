const pool = require ("../db.js");

async function createTicket (req,res) {

    console.log(
"createtickets called"
);

     const user_id = req.user.user_id;
     
     const title = req.body.title;
     const department_name = req.body.department;
   //  const priority = req.body.priority;
     const description = req.body.description;
     const response = req.body.expectedResponses;



     const [dept] = await pool.query(`select department_id from departments where department_name=?`,[department_name]);
    
    if(dept.length===0){
return res.status(404).json({message:"department not found"});
}

     const department_id = dept[0].department_id;


    const [result] = await pool.query (`insert into tickets (title , description , created_by , assigned_department ) values (?,?,?,?) ` ,
         [title ,description ,user_id , department_id ]);

    const ticketId =
result.insertId;

for( const r of response ){
      await pool.query(
`INSERT INTO expected_responses ( ticket_id, response_text)
VALUES (?,?) `,[ticketId,r]); 
}

res.json({ message: "ticket created" });

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