const {Router}=require ("express");

const departmentRouter=Router();

const {auth,adminOnly} = require ("../middlewares/auth.js");

const {createDepartment,getDepartments} = require ("../controllers/departmentController.js");


departmentRouter.post("/departments",auth,adminOnly,createDepartment);

departmentRouter.get("/departments",auth,adminOnly,getDepartments);


module.exports={
    departmentRouter : departmentRouter
}
