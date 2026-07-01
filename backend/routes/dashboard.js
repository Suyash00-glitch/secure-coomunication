
const {Router}=require("express");

const dashboardRouter=Router();

const {auth,adminOnly}=require("../middlewares/auth.js");

const {getStats,getDashboardStats}=require("../controllers/dashboardController.js");


dashboardRouter.get("/dashboard",auth,adminOnly,getStats);


dashboardRouter.get("/dashboard/stats", auth,getDashboardStats);



module.exports={

dashboardRouter:dashboardRouter

};

