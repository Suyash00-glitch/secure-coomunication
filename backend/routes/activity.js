const {Router}=require ("express");
const activityRouter=Router();
const {auth,adminOnly,internalOnly} = require ("../middlewares/auth.js");
const {getActivityHistory} = require ("../controllers/activityController.js");

activityRouter.get("/activity",auth,getActivityHistory);

module.exports = {
    activityRouter:activityRouter
};
