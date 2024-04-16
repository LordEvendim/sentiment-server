import express, { Router } from "express";

import { reporterController } from "#controller/reporterController";
import { isAuthenticated } from "#middleware/isAuthenticated";

const router: Router = express.Router();

router.post(
  "/page-weekly",
  isAuthenticated,
  reporterController.generateWeeklyPageReport
);

router.get(
  "/page-weekly",
  isAuthenticated,
  reporterController.getWeeklyPageReport
);

router.get(
  "/dashboard/general",
  isAuthenticated,
  reporterController.getGeneralDashboardData
);

export { router as reporterRouter };
