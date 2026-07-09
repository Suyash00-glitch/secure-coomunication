const {Router}=require ("express");
const notificationRouter=Router();
const {auth,adminOnly,internalOnly} = require ("../middlewares/auth.js");
const {createNotification,getNotifications  
    ,getNotificationDetail,  
    getLatestNotifications , getInternalNotifications
   , getInternalNotificationDetail,
    acknowledgeNotification,uploadNotificationAttachment} = require ("../controllers/notificationController.js");
const upload = require("../middlewares/upload");



notificationRouter.post("/notifications",auth,createNotification);
notificationRouter.get("/notifications",auth,getNotifications);
notificationRouter.get("/notifications/latest",auth,adminOnly,getLatestNotifications);
notificationRouter.get("/notifications/:id",auth,getNotificationDetail);
notificationRouter.get("/internal/notifications",auth,internalOnly,getInternalNotifications);
notificationRouter.get( "/internal/notifications/:id",auth,internalOnly,getInternalNotificationDetail);
notificationRouter.patch("/internal/notifications/:id/acknowledge",auth,internalOnly,acknowledgeNotification);
notificationRouter.post("/notifications/:notificationId/attachment",auth,
    upload.single("attachment"),uploadNotificationAttachment);


module.exports={
    notificationRouter : notificationRouter
}
