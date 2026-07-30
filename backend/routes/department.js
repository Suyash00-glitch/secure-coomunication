const {Router}=require ("express");
const departmentRouter=Router();
const {auth,adminOnly} = require ("../middlewares/auth.js");
const { createDepartment, getDepartments, getActiveDepartments,
        deactivateDepartment, activateDepartment ,
      updateDepartment} = require("../controllers/departmentController.js");

departmentRouter.post("/departments", auth, adminOnly, createDepartment);
departmentRouter.get("/departments", auth, adminOnly, getDepartments);
departmentRouter.get("/departments/active", auth, getActiveDepartments);
departmentRouter.patch("/departments/:id/deactivate", auth, adminOnly, deactivateDepartment);
departmentRouter.patch("/departments/:id/activate", auth, adminOnly, activateDepartment);
departmentRouter.patch("/departments/:id/activate", auth, adminOnly, activateDepartment);  
departmentRouter.put("/departments/:id", auth, adminOnly, updateDepartment);

module.exports={
    departmentRouter : departmentRouter
}
