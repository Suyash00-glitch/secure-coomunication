const {Router}=require ("express");

const userRouter=Router();

const{signup,signin,getUsers,updateUser,deactivateUser,
    createUser,activateUser,getProfile}=require("../controllers/userController.js");

const {auth, adminOnly , internalOnly} = require("../middlewares/auth.js");

userRouter.post("/signup",signup);

userRouter.post("/signin",signin);


userRouter.get("/users",auth,adminOnly,getUsers);


userRouter.put("/users/:id",auth,adminOnly,updateUser);


userRouter.patch("/users/:id/deactivate",auth,adminOnly,deactivateUser);

userRouter.patch("/users/:id/activate",auth,adminOnly,activateUser);


userRouter.post("/users",auth,adminOnly,createUser);

userRouter.get("/internal/profile",auth,internalOnly,getProfile);


module.exports={
    userRouter:userRouter
}