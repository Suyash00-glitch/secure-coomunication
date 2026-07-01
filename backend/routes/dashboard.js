
const {Router}=require("express");

const dashboardRouter=Router();

const {auth,adminOnly}=require("../middlewares/auth.js");

const {getStats}=require("../controllers/dashboardController.js");


dashboardRouter.get("/dashboard",auth,adminOnly,getStats);


module.exports={

dashboardRouter:dashboardRouter

};

