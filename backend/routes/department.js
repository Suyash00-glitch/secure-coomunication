const {Router}=require ("express");

const departmentRouter=Router();

const {auth,adminOnly} = require ("../middlewares/auth.js");

const {createDepartment,getDepartments,
      getActiveDepartments} = require ("../controllers/departmentController.js");


departmentRouter.post("/departments",auth,adminOnly,createDepartment);

departmentRouter.get("/departments",auth,adminOnly,getDepartments);

departmentRouter.get( "/departments/active",auth,getActiveDepartments);

module.exports={
    departmentRouter : departmentRouter
}
