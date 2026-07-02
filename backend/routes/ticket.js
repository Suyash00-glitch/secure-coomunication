const {Router}=require ("express");
const ticketRouter=Router();
const {auth,adminOnly,internalOnly} = require ("../middlewares/auth.js");
const {createTicket} = require ("../controllers/ticketController.js");
const {getTickets} = require ("../controllers/ticketController.js");
const {getTicketDetail} = require ("../controllers/ticketController.js");
const {getOpenTickets,getInternalTickets,getInternalTicketDetail,
        getTicketResponses,respondToTicket,
        getTicketConversation} = require ("../controllers/ticketController.js")

ticketRouter.post("/tickets",auth,createTicket);
ticketRouter.get("/tickets",auth,getTickets);
ticketRouter.get("/tickets/open",auth,adminOnly,getOpenTickets);
ticketRouter.get("/tickets/:id",auth,getTicketDetail);
ticketRouter.get("/internal/tickets",auth,internalOnly,getInternalTickets);
ticketRouter.get("/internal/tickets/:id",auth,internalOnly,getInternalTicketDetail);
ticketRouter.get("/internal/tickets/:id/responses",auth,internalOnly,getTicketResponses);
ticketRouter.post("/internal/tickets/:id/respond",auth,internalOnly,respondToTicket);
ticketRouter.get("/internal/tickets/:id/conversation",auth,internalOnly,getTicketConversation);

module.exports={
    ticketRouter : ticketRouter
}
