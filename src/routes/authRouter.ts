import express, { Router } from "express";
import { isAdmin } from "src/middleware/isAdmin";

// import { isAuthenticated } from "src/middleware/isAuthenticated";
import { authController } from "#controller/authController";

const router: Router = express.Router();

router.get("/", authController.getSession);
router.post("/logout", authController.logout);

router.post("/login", authController.login);
router.post("/register", isAdmin, authController.register);

router.get(
  "/meta/llat",
  // isAuthenticated,
  authController.getLongLivedAccessToken
);

export { router as authRouter };
