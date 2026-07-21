const {Router}=require ("express");
const ticketRouter=Router();
const {auth,adminOnly,internalOnly} = require ("../middlewares/auth.js");
const upload = require("../middlewares/upload");

const {createTicket} = require ("../controllers/ticketController.js");
const {getTickets} = require ("../controllers/ticketController.js");
const {getTicketDetail} = require ("../controllers/ticketController.js");
const {getOpenTickets,getInternalTickets,getInternalTicketDetail,
        getTicketResponses,respondToTicket,forwardTicket,
        getTicketConversation,uploadAttachment,downloadTicketAttachment} = require ("../controllers/ticketController.js")
const { replyToTicket , acknowledgeTicket,closeTicket} = require("../controllers/ticketController.js");
const {getAdminTickets} = require ("../controllers/ticketController.js");



ticketRouter.post("/tickets",auth,createTicket);
ticketRouter.get("/tickets",auth,getTickets);
ticketRouter.get("/tickets/open",auth,adminOnly,getOpenTickets);
ticketRouter.get("/admin/tickets",auth,adminOnly,getAdminTickets);
ticketRouter.get("/tickets/:id",auth,getTicketDetail);
ticketRouter.get("/internal/tickets",auth,internalOnly,getInternalTickets);
ticketRouter.get("/internal/tickets/:id",auth,internalOnly,getInternalTicketDetail);
ticketRouter.get("/internal/tickets/:id/responses",auth,internalOnly,getTicketResponses);
ticketRouter.post("/internal/tickets/:id/respond",auth,internalOnly,respondToTicket);
ticketRouter.get("/internal/tickets/:id/conversation",auth,internalOnly,getTicketConversation);

ticketRouter.post( "/tickets/:ticketId/attachment", auth, upload.single("attachment"),uploadAttachment);

ticketRouter.get("/tickets/:ticketId/attachments/:attachmentId/download", auth, downloadTicketAttachment);

ticketRouter.post("/tickets/:id/reply",auth, replyToTicket);

ticketRouter.patch("/internal/tickets/:id/acknowledge",auth,internalOnly,acknowledgeTicket);

ticketRouter.patch("/tickets/:id/close", auth, closeTicket);

ticketRouter.patch("/internal/tickets/:id/forward", auth, internalOnly, forwardTicket);


module.exports={
    ticketRouter : ticketRouter
}
