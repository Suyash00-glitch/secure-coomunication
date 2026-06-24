const {Router}=require ("express");

const notificationRouter=Router();

const {auth,adminOnly} = require ("../middlewares/auth.js");

const {createNotification,getNotifications ,getNotificationDetail} = require ("../controllers/notificationController.js");


notificationRouter.post("/notifications",auth,createNotification);

notificationRouter.get("/notifications",auth,getNotifications);

notificationRouter.get("/notifications/:id",auth,getNotificationDetail);

module.exports={
    notificationRouter : notificationRouter
}