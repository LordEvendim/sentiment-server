import express, { Router } from "express";

import { metaController } from "#controller/metaController";
import { isAuthenticated } from "#middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/accounts", isAuthenticated, metaController.getUserPages);
router.get("/integration", isAuthenticated, metaController.getUserIntegration);
router.get("/page/insights", isAuthenticated, metaController.getPageInsights);
router.get("/campaigns/top", isAuthenticated, metaController.getTopCampaigns);

router.post("/selected-page", isAuthenticated, metaController.selectPage);
router.post(
  "/selected-ad-account",
  isAuthenticated,
  metaController.selectAdAccount
);
router.post("/access-token", isAuthenticated, metaController.createAccessToken);

export { router as metaRouter };
