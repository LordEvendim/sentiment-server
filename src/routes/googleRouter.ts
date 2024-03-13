import express, { Router } from "express";

import { googleController } from "#controller/googleController";
import { isAuthenticated } from "#middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/accounts", isAuthenticated, googleController.getUserPages);
router.get(
  "/integration",
  isAuthenticated,
  googleController.getUserIntegration
);

router.post("/selected-page", isAuthenticated, googleController.selectPage);
router.post(
  "/access-token",
  isAuthenticated,
  googleController.createAccessToken
);

export { router as googleRouter };
