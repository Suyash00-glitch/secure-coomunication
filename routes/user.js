const {Router}=require ("express");

const userRouter=Router();
const{signup,signin}=require("../controllers/userController.js");
userRouter.post("/signup",signup)

userRouter.post("/signin",signin)

module.exports={
    userRouter:userRouter
}