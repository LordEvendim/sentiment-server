import express, { Router } from "express";

import { reporterController } from "#controller/reporterController";
import { isAuthenticated } from "#middleware/isAuthenticated";

const router: Router = express.Router();

router.post(
  "/general/weekly",
  isAuthenticated,
  reporterController.generateGeneralReport
);

router.get(
  "/general/weekly",
  isAuthenticated,
  reporterController.getGeneralReport
);

router.get(
  "/dashboard/general",
  isAuthenticated,
  reporterController.getGeneralDashboardData
);

export { router as reporterRouter };
