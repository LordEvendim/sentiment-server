import express, { Router } from "express";

import { reporterController } from "#controller/reporterController";
import { isAuthenticated } from "#middleware/isAuthenticated";

const router: Router = express.Router();

router.post(
  "/overview",
  isAuthenticated,
  reporterController.generateGeneralReport
);

router.get("/overview", isAuthenticated, reporterController.getGeneralReport);
router.get("/metric", isAuthenticated, reporterController.getMetricReport);
router.get("/campaign", isAuthenticated, reporterController.getCampaignReport);

router.get("/chart", isAuthenticated, reporterController.getChartData);
router.get(
  "/dashboard/general",
  isAuthenticated,
  reporterController.getGeneralDashboardData
);

export { router as reporterRouter };
