const { Router } = require("express");

const departmentRouter = Router();

const auth = require("../middlewares/auth.js");

const { getDepartments } = require("../controllers/departmentController.js");

departmentRouter.get(
    "/departments",
    auth,
    getDepartments
);

module.exports = {
    departmentRouter
};