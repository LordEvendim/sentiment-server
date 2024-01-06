import express, { Router } from "express";

import { userController } from "#controller/userController";
import { isAuthenticated } from "src/middleware/isAuthenticated";

const router: Router = express.Router();

// router.get("/dashboards", isAuthenticated, userController.getUserDashboards);

export { router as userRouter };
