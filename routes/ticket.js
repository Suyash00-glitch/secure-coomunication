const {Router}=require ("express");

const ticketRouter=Router();

const auth = require ("../middlewares/auth.js");

const {createTicket} = require ("../controllers/ticketController.js");

const {getTickets} = require ("../controllers/ticketController.js");

const {getTicketDetail} = require ("../controllers/ticketController.js");

ticketRouter.post("/tickets",auth,createTicket);


ticketRouter.get("/tickets",auth,getTickets);

ticketRouter.get("/tickets/:id",auth,getTicketDetail);

module.exports={
    ticketRouter : ticketRouter
}