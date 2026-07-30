const {Router}=require ("express");
const userRouter=Router();
const{signup,signin,loginAdmin,loginExternal,loginInternal,forgotPassword,resetPassword,getUsers,updateUser,deactivateUser,
    createUser,activateUser,getProfile,changePassword,logoutInternal}=require("../controllers/userController.js");
const {auth, adminOnly , internalOnly} = require("../middlewares/auth.js");

userRouter.post("/signup",signup);
userRouter.post("/signin",signin);
userRouter.post("/auth/admin/login",loginAdmin);
userRouter.post("/auth/external/login",loginExternal);
userRouter.post("/auth/internal/login",loginInternal);
userRouter.post("/auth/forgot-password",forgotPassword);
userRouter.post("/auth/reset-password",resetPassword);
userRouter.get("/users",auth,adminOnly,getUsers);
userRouter.put("/users/:id",auth,adminOnly,updateUser);
userRouter.patch("/users/:id/deactivate",auth,adminOnly,deactivateUser);
userRouter.patch("/users/:id/activate",auth,adminOnly,activateUser);
userRouter.post("/users",auth,adminOnly,createUser);
userRouter.get("/profile",auth,getProfile);
userRouter.patch("/change-password",auth,changePassword);
userRouter.post("/internal/logout",auth,internalOnly,logoutInternal);

module.exports={
    userRouter:userRouter
};
