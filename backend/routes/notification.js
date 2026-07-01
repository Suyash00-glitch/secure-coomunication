const {Router}=require ("express");

const notificationRouter=Router();

const {auth,adminOnly,internalOnly} = require ("../middlewares/auth.js");

const {createNotification,getNotifications  
    ,getNotificationDetail,  
    getLatestNotifications , getInternalNotifications
   , getInternalNotificationDetail,
    acknowledgeNotification} = require ("../controllers/notificationController.js");


notificationRouter.post("/notifications",auth,createNotification);

notificationRouter.get("/notifications",auth,getNotifications);

notificationRouter.get("/notifications/latest",auth,adminOnly,getLatestNotifications);

notificationRouter.get("/notifications/:id",auth,getNotificationDetail);

notificationRouter.get("/internal/notifications",  
               auth,internalOnly,getInternalNotifications);

notificationRouter.get( "/internal/notifications/:id",
                auth,internalOnly,getInternalNotificationDetail);

notificationRouter.patch("/internal/notifications/:id/acknowledge",auth,
                   internalOnly,acknowledgeNotification);

//add internalOnly middleware lateron

module.exports={
    notificationRouter : notificationRouter
}