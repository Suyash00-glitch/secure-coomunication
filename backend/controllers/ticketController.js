const pool = require ("../db.js");
const path = require("path");
const fs = require("fs");
const { logActivity } = require("../services/activityLogService.js");

/**
 * Mirrors the authorization already enforced by getTicketDetail() (Admin /
 * External) and getInternalTicketDetail() (Internal), so ticket detail
 * access and ticket attachment download access can't silently diverge.
 *
 * `ticket` must include: created_by, assigned_department, assigned_to.
 */
function canAccessTicket(user, ticket) {
  if (user.role === "admin") {
    return true;
  }
  if (user.role === "outside") {
    // Same rule as getTicketDetail(): External users only see their own tickets.
    return ticket.created_by === user.user_id;
  }
  if (user.role === "secure") {
    // Same rule as getInternalTicketDetail(): must be the assigned department,
    // and if another internal user has already picked up the ticket, it's
    // off-limits to everyone else in that department.
    if (ticket.assigned_department !== user.department_id) {
      return false;
    }
    if (ticket.assigned_to && ticket.assigned_to !== user.user_id) {
      return false;
    }
    return true;
  }
  return false;
}

async function createTicket(req,res) {
    console.log("createtickets called");
    const user_id = req.user.user_id;
    const title = req.body.title;
    const department_name = req.body.department;
    const description = req.body.description;
    const response = req.body.expectedResponses;

    const [dept] = await pool.query(`select department_id from departments where department_name=?`,[department_name]);
    if(dept.length===0){ return res.status(404).json({message:"department not found"}); }
    const department_id = dept[0].department_id;

    const [result] = await pool.query(
`insert into tickets (title, description, created_by, assigned_department) values (?,?,?,?)`,
[title, description, user_id, department_id]);
    const ticketId = result.insertId;

    
     await pool.query(
`INSERT INTO ticket_conversation(ticket_id,sender_id,sender_type,message_text) VALUES(?,?,?,?)`,
[ticketId, user_id, "external", description]);

    for(const r of response){
        await pool.query(`INSERT INTO expected_responses (ticket_id, response_text) VALUES (?,?)`,[ticketId,r]);
    }


    const io = req.app.get("io");

io.to(`department-${department_id}`).emit(
    "new-ticket",
    {
        ticket_id: ticketId
    }
);

    await logActivity({
        user_id: user_id,
        department_id: department_id,
        action: "Ticket Created",
        item_type: "ticket",
        item_id: ticketId,
    });

    res.json({
    message: "Ticket created",
    ticket_id: ticketId
});;
}

async function getTickets(req,res){
    console.log("gettickets called");

    const [rows] = await pool.query(
`
SELECT
    t.ticket_id,
    t.title,
    d.department_name,
    s.status_name,
    t.created_at,
    t.updated_at,
    t.assigned_to,
    t.acknowledgement_at
FROM tickets t
JOIN departments d
ON d.department_id=t.assigned_department
LEFT JOIN status_master s
ON s.status_id=t.status_id
WHERE t.created_by=?
ORDER BY t.created_at DESC
`,
[req.user.user_id]);

    const tickets = rows.map(ticket => ({
        ...ticket,
        display_status:
            ticket.status_name?.toLowerCase() === "closed"
                ? "Closed"
                : ticket.assigned_to
                    ? "Being Handled"
                    : "Open"
    }));

    res.json(tickets);
}

async function getTicketDetail(req, res) {

try {

    const ticketId = req.params.id;
    const userId = req.user.user_id;

    let query = `

SELECT

t.ticket_id,
t.title,
t.description,
t.created_at,
t.updated_at,
t.assigned_to,
t.acknowledgement_at,
t.assigned_department,
u.username,
d.department_name,
s.status_name

FROM tickets t

JOIN users u
ON u.user_id = t.created_by

JOIN departments d
ON d.department_id = t.assigned_department

JOIN status_master s
ON s.status_id = t.status_id

WHERE t.ticket_id = ?

`;

    let params = [ticketId];

    if (req.user.role !== "admin") {

        query += ` AND t.created_by = ?`;

        params.push(userId);

    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {

        return res.status(404).json({
            message: "Ticket not found"
        });

    }

    const [attachments] = await pool.query(

`
SELECT

attachment_id,
file_name,
file_location,
file_type

FROM ticket_attachments

WHERE ticket_id = ?
`,

    [ticketId]

    );

    const [conversation] = await pool.query(

`
SELECT
tc.conversation_id,
tc.message_text,
tc.sender_type,
u.username,
tc.created_at
FROM ticket_conversation tc

LEFT JOIN users u
ON u.user_id = tc.sender_id

WHERE tc.ticket_id = ?

ORDER BY tc.created_at ASC
`,

    [ticketId]

    );

    const ticket = rows[0];

    ticket.display_status =
        ticket.status_name?.toLowerCase() === "closed"
            ? "Closed"
            : ticket.assigned_to
                ? "Being Handled"
                : "Open";

    await logActivity({
    user_id: userId,
    department_id: ticket.assigned_department,
    action: "Ticket Viewed",
    item_type: "ticket",
    item_id: ticketId
});

    res.json({

        ...ticket,

        attachments,
        conversation

    });

}

catch (err) {

    console.log(err);

    res.status(500).json({
        message: "Server error"
    });

}

}



async function getOpenTickets(req,res){
console.log("getOpenTickets called");
try{
const page = Number(req.query.page)||1;
const limit = Number(req.query.limit)||10;
const offset = (page-1)*limit;

const [rows] = await pool.query(
`SELECT t.ticket_id, t.ticket_number, t.title, t.created_at, s.status_name
FROM tickets t JOIN status_master s ON t.status_id=s.status_id
WHERE LOWER(s.status_name) != 'closed'
ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,[limit,offset]);

const [[count]] = await pool.query(
`SELECT COUNT(*) total FROM tickets t JOIN status_master s ON t.status_id=s.status_id
WHERE LOWER(s.status_name) != 'closed'`);

res.json({tickets:rows, page, total:count.total, pages:Math.ceil(count.total/limit)});
}
catch(err){
console.log(err);
res.status(500).json({message:"server error"});
}
}

async function getInternalTickets(req, res) {
try{
const departmentId = req.user.department_id;
const [rows] = await pool.query(
`SELECT t.ticket_id, t.title, t.description, t.created_at,t.assigned_to, t.acknowledgement_at,
sm.status_name, u.username AS created_by
FROM tickets t
JOIN status_master sm ON t.status_id = sm.status_id
LEFT JOIN users u ON t.created_by = u.user_id
WHERE t.assigned_department = ?
ORDER BY t.created_at DESC`,[departmentId]);
res.json(rows);
}
catch(err){
console.log(err);
res.status(500).json({message:"Server error"});
}
}

async function getInternalTicketDetail(req, res) {

try{

const ticketId = req.params.id;
const departmentId = req.user.department_id;

const [rows] = await pool.query(

`
SELECT

t.ticket_id,
t.title,
t.description,
t.created_at,
t.updated_at,
t.closed_at,
t.acknowledgement_at,
t.acknowledged_by,
t.assigned_to,
sm.status_id,
sm.status_name,
u.username AS created_by_name,
ack.username AS acknowledged_by_name

FROM tickets t

JOIN status_master sm
ON t.status_id = sm.status_id

LEFT JOIN users u
ON t.created_by = u.user_id

LEFT JOIN users ack
ON t.acknowledged_by = ack.user_id

WHERE t.ticket_id = ?
AND t.assigned_department = ?

`,

[ticketId, departmentId]

);

if(rows.length === 0){

    return res.status(404).json({
        message:"Ticket not found"
    });

}


if(
    rows[0].assigned_to &&
    rows[0].assigned_to !== req.user.user_id &&
    req.user.role !== "admin"
){

    return res.status(403).json({
        message:"Ticket is already being handled by another user"
    });

}





const [attachments] = await pool.query(

`
SELECT

attachment_id,
file_name,
file_location,
file_type

FROM ticket_attachments

WHERE ticket_id = ?

`,

[ticketId]

);

await logActivity({
    user_id: req.user.user_id,
    department_id: req.user.department_id,
    action: "Ticket Viewed",
    item_type: "ticket",
    item_id: ticketId
});

res.json({

    ...rows[0],

    attachments

});

}

catch(err){

console.log(err);

res.status(500).json({
message:"Server error"
});

}

}



async function getTicketResponses(req, res) {
try{
const ticketId = req.params.id;
const departmentId = req.user.department_id;
const [ticket] = await pool.query(
`SELECT ticket_id FROM tickets WHERE ticket_id = ? AND assigned_department = ?`,[ticketId, departmentId]);
if(ticket.length === 0){ return res.status(404).json({message:"Ticket not found"}); }
const [responses] = await pool.query(
`SELECT response_id, response_text FROM expected_responses WHERE ticket_id = ? ORDER BY response_id`,[ticketId]);
res.json(responses);
}
catch(err){
console.log(err);
res.status(500).json({message:"Server error"});
}
}



async function respondToTicket(req, res) {
try{
const ticketId = req.params.id;
const { response_id } = req.body;
const userId = req.user.user_id;
const departmentId = req.user.department_id;

const [ticket] = await pool.query(
`
SELECT ticket_id, assigned_to FROM tickets
WHERE ticket_id = ? AND assigned_department = ? `,
[ticketId, departmentId]);


if(ticket.length === 0){ return res.status(404).json({message: "Ticket not found"}); }


if(
    ticket[0].assigned_to &&
    ticket[0].assigned_to !== userId &&
    req.user.role !== "admin"
){
    return res.status(403).json({
        message: "Ticket already assigned to another user"
    });
}



const [response] = await pool.query(
`SELECT response_text FROM expected_responses WHERE response_id = ? AND ticket_id = ?`,[response_id, ticketId]);
if(response.length === 0){ return res.status(404).json({message: "Response not found"}); }

await pool.query(
`INSERT INTO ticket_conversation
(ticket_id, sender_id, sender_type, message_text)
VALUES(?,?,?,?)`,
[ticketId, userId, "internal", response[0].response_text]
);



await pool.query(`UPDATE tickets
SET assigned_to = COALESCE(assigned_to, ?),
acknowledged_by = COALESCE(acknowledged_by, ?),
acknowledgement_at = COALESCE(acknowledgement_at, NOW())
WHERE ticket_id = ?`,[userId, userId, ticketId]);



await pool.query(`DELETE FROM expected_responses WHERE ticket_id = ?`,[ticketId]);



const io = req.app.get("io");

io.to(`ticket-${ticketId}`).emit(
    "ticket-conversation-updated",
    {
        ticket_id: ticketId
    }
);

await logActivity({
    user_id: userId,
    department_id: departmentId,
    action: "Ticket Replied",
    item_type: "ticket",
    item_id: ticketId,
});

const [[creator]] = await pool.query(
    `SELECT created_by FROM tickets WHERE ticket_id = ?`,
    [ticketId]
);

await logActivity({
    user_id: creator.created_by,
    department_id: departmentId,
    action: "Received Ticket Reply",
    item_type: "ticket",
    item_id: ticketId
});


res.json({message: "Response sent"});
}
catch(err){
console.log(err);
res.status(500).json({message: "Server error"});
}
}




async function getTicketConversation(req, res) {
try{
const ticketId = req.params.id;
const departmentId = req.user.department_id;
const [ticket] = await pool.query(
`SELECT ticket_id FROM tickets WHERE ticket_id=? AND assigned_department=?`,[ticketId, departmentId]);
if(ticket.length===0){ return res.status(404).json({message:"Ticket not found"}); }
const [rows] = await pool.query(
`SELECT tc.conversation_id, tc.sender_type, tc.message_text, tc.created_at, u.username
FROM ticket_conversation tc JOIN users u ON tc.sender_id=u.user_id
WHERE tc.ticket_id=? ORDER BY tc.created_at`,[ticketId]);
res.json(rows);
}
catch(err){
console.log(err);
res.status(500).json({message:"Server error"});
}
}




async function uploadAttachment(req, res) {

    console.log("Params:", req.params);
console.log("User:", req.user);
console.log("File:", req.file);

    try {

        const { ticketId } = req.params;

        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        await pool.query(

            `
            INSERT INTO ticket_attachments
            (
                ticket_id,
                uploaded_by,
                file_name,
                file_location,
                file_type
            )
            VALUES (?,?,?,?,?)
            `,

            [
                ticketId,
                req.user.user_id,
                file.originalname,
                file.path,
                file.mimetype
            ]

        );

        const io = req.app.get("io");

io.to(`ticket-${ticketId}`).emit("ticket-conversation-updated");

res.json({
  message: "Attachment uploaded"
});

        res.json({
            message: "Attachment uploaded successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server error"
        });

    }

}




async function replyToTicket(req, res) {

    
    try {

        const ticketId = req.params.id;
        const userId = req.user.user_id;

        const {message,expectedResponses} = req.body;

console.log("replyToTicket called", ticketId);

const [ticket] = await pool.query(
`
SELECT created_by
FROM tickets
WHERE ticket_id = ?
`,
[ticketId]
);

if(
    ticket.length === 0 ||
    ticket[0].created_by !== userId
){
    return res.status(403).json({
        message: "Access denied"
    });
}







        await pool.query(
            `
            INSERT INTO ticket_conversation
            (
                ticket_id,
                sender_id,
                sender_type,
                message_text
            )
            VALUES (?,?,?,?)
            `,
            [
                ticketId,
                userId,
                "external",
                message
            ]
        );

        for (const response of expectedResponses) {

            await pool.query(
                `
                INSERT INTO expected_responses
                (
                    ticket_id,
                    response_text
                )
                VALUES (?,?)
                `,
                [
                    ticketId,
                    response
                ]
            );

        }

        const io = req.app.get("io");
        
        console.log(`Emitting ticket-conversation-updated to ticket-${ticketId}`);

        io.to(`ticket-${ticketId}`).emit(
            "ticket-conversation-updated",
            {
                ticket_id: ticketId
            }
        );


        const [dept] = await pool.query(
`
SELECT assigned_department
FROM tickets
WHERE ticket_id = ?
`,
[ticketId]
);

io.to(`department-${dept[0].assigned_department}`).emit(
    "ticket-updated",
    {
        ticket_id: ticketId
    }
);

await logActivity({
    user_id: userId,
    department_id: dept[0].assigned_department,
    action: "Ticket Replied",
    item_type: "ticket",
    item_id: ticketId,
});

        res.json({
            message: "Reply sent successfully"
        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server error"
        });

    }

}




async function acknowledgeTicket(req, res) {
  const ticketId = req.params.id;
  const userId = req.user.user_id;

  await pool.query(
    `UPDATE tickets
     SET assigned_to = ?,
         acknowledged_by = ?,
         acknowledgement_at = NOW(),
         status_id = 3
     WHERE ticket_id = ?
     AND assigned_to IS NULL`,
    [userId, userId, ticketId]
  );

  const io = req.app.get("io");
  io.to(`department-${req.user.department_id}`).emit("ticket-updated");

  await logActivity({
    user_id: userId,
    department_id: req.user.department_id,
    action: "Ticket Received",
    item_type: "ticket",
    item_id: ticketId,
  });

  res.json({ message: "Ticket acknowledged" });
}



async function closeTicket(req, res) {
  try {
    const ticketId = req.params.id;
    const userId = req.user.user_id;

    
    const [ticket] = await pool.query(
      `SELECT created_by, assigned_department FROM tickets WHERE ticket_id = ?`,
      [ticketId]
    );

    if (ticket.length === 0) return res.status(404).json({ message: "Ticket not found" });
    if (ticket[0].created_by !== userId) return res.status(403).json({ message: "Access denied" });

    
    const [status] = await pool.query(
      `SELECT status_id FROM status_master WHERE LOWER(status_name) = 'closed'`
    );
    if (status.length === 0) return res.status(500).json({ message: "Closed status not found" });

    await pool.query(
      `UPDATE tickets SET status_id = ?, closed_at = NOW() WHERE ticket_id = ?`,
      [status[0].status_id, ticketId]
    );

    const io = req.app.get("io");


    io.to(`department-${ticket[0].assigned_department}`).emit("ticket-updated", { ticket_id: ticketId });

    io.to(`ticket-${ticketId}`).emit("ticket-closed", { ticket_id: ticketId });

    await logActivity({
      user_id: userId,
      department_id: ticket[0].assigned_department,
      action: "Ticket Closed",
      item_type: "ticket",
      item_id: ticketId,
    });

    res.json({ message: "Ticket closed" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}



/**
 * GET /api/tickets/:ticketId/attachments/:attachmentId/download
 *
 * Requires `auth` only (see routes/ticket.js) — authorization varies by
 * role, so it's enforced here via canAccessTicket() rather than a single
 * fixed role middleware. The file path is taken ONLY from the database
 * row (file_location), never from user input, and the attachment must
 * belong to the exact ticketId in the URL so a valid attachmentId can't be
 * paired with an unrelated ticketId to bypass authorization.
 */
async function downloadTicketAttachment(req, res) {
  try {
    const { ticketId, attachmentId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        ta.attachment_id,
        ta.file_name,
        ta.file_location,
        ta.file_type,
        t.created_by,
        t.assigned_department,
        t.assigned_to
      FROM ticket_attachments ta
      JOIN tickets t ON t.ticket_id = ta.ticket_id
      WHERE ta.attachment_id = ? AND ta.ticket_id = ?
      `,
      [attachmentId, ticketId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    const attachment = rows[0];

    if (!canAccessTicket(req.user, attachment)) {
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

async function getAdminTickets(req, res) {
    try {

        const [rows] = await pool.query(
            `
            SELECT
                t.ticket_id,
                t.ticket_number,
                t.title,
                u.username AS created_by,
                d.department_name,
                s.status_name,
                t.created_at,
                t.updated_at,
                t.assigned_to,
                t.acknowledgement_at,
                t.acknowledged_by
            FROM tickets t
            LEFT JOIN users u
                ON u.user_id = t.created_by
            LEFT JOIN departments d
                ON d.department_id = t.assigned_department
            LEFT JOIN status_master s
                ON s.status_id = t.status_id
            ORDER BY t.created_at DESC
            `
        );

        const tickets = rows.map(ticket => ({
            ...ticket,
            display_status:
                ticket.status_name?.toLowerCase() === "closed"
                    ? "Closed"
                    : ticket.assigned_to
                        ? "Being Handled"
                        : "Open"
        }));

        res.json(tickets);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error"
        });
    }
}



async function forwardTicket(req, res) {
  try {
    const ticketId = req.params.id;
    const userId = req.user.user_id;
    const departmentId = req.user.department_id;

    const [ticket] = await pool.query(
      `SELECT assigned_to FROM tickets WHERE ticket_id = ? AND assigned_department = ?`,
      [ticketId, departmentId]
    );

   

    if (ticket.length === 0) return res.status(404).json({ message: "Ticket not found" });

    if (ticket[0].assigned_to !== userId) {
      return res.status(403).json({ message: "Only the assigned user can forward this ticket" });
    }

     await pool.query(
  `UPDATE tickets 
   SET assigned_to = NULL,
       acknowledged_by = NULL,
       acknowledgement_at = NULL,
       status_id = 1
   WHERE ticket_id = ?`,
  [ticketId]
);

    const io = req.app.get("io");
    io.to(`department-${departmentId}`).emit("ticket-updated", { ticket_id: ticketId });

    await logActivity({
      user_id: userId,
      department_id: departmentId,
      action: "Ticket Forwarded",
      item_type: "ticket",
      item_id: ticketId,
    });

    res.json({ message: "Ticket forwarded successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}


module.exports={
    createTicket, getTickets, getTicketDetail, getOpenTickets,
    getInternalTickets, getInternalTicketDetail, getTicketResponses,
    respondToTicket, getTicketConversation , uploadAttachment , replyToTicket
    , acknowledgeTicket , closeTicket, getAdminTickets,
     downloadTicketAttachment , forwardTicket
}
