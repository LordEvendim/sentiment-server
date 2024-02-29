import express, { Router } from "express";
import { isAdmin } from "src/middleware/isAdmin";

import { authController } from "#controller/authController";
import { googleController } from "#controller/googleController";
import { isAuthenticated } from "#middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/", authController.getSession);
router.delete("/logout", authController.logout);

router.post("/login", authController.login);
router.post("/register", isAdmin, authController.register);

router.get(
  "/meta/llat",
  isAuthenticated,
  authController.getLongLivedAccessToken
);
router.get(
  "/google/url",
  isAuthenticated,
  googleController.getAuthorizationUrl
);

export { router as authRouter };
