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
  "/selected-ad-account",
  isAuthenticated,
  googleController.selectAdAccount
);
router.post(
  "/access-token",
  isAuthenticated,
  googleController.createAccessToken
);

router.delete("/logout", isAuthenticated, googleController.logout);

export { router as googleRouter };
