import express, { Router } from "express";

import { metaController } from "#controller/metaController";
import { isAuthenticated } from "#middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/accounts", isAuthenticated, metaController.getUserPages);
router.get("/page/insights", isAuthenticated, metaController.getPageInsights);

router.post("/selected-page", isAuthenticated, metaController.selectPage);

export { router as metaRouter };
