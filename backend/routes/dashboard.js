const { Router } = require("express");
const dashboardRouter = Router();
const { auth, adminOnly, internalOnly } = require("../middlewares/auth.js");
const { getStats, getDashboardStats, getInternalStats } = require("../controllers/dashboardController.js");

dashboardRouter.get("/dashboard", auth, adminOnly, getStats);
dashboardRouter.get("/dashboard/stats", auth, getDashboardStats);
dashboardRouter.get("/dashboard/internal", auth, internalOnly, getInternalStats); // ← add

module.exports = { dashboardRouter : dashboardRouter };