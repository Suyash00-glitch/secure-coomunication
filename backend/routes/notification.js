const {Router}=require ("express");

const notificationRouter=Router();

const {auth,adminOnly} = require ("../middlewares/auth.js");

const {createNotification,getNotifications ,getNotificationDetail, getLatestNotifications} = require ("../controllers/notificationController.js");


notificationRouter.post("/notifications",auth,createNotification);

notificationRouter.get("/notifications",auth,getNotifications);

notificationRouter.get("/notifications/latest",auth,adminOnly,getLatestNotifications);

notificationRouter.get("/notifications/:id",auth,getNotificationDetail);

module.exports={
    notificationRouter : notificationRouter
}