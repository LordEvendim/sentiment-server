import express, { Router } from "express";

import { authController } from "#controller/authController";
import { isAdmin } from "src/middleware/isAdmin";

const router: Router = express.Router();

router.get("/", authController.getSession);
router.post("/logout", authController.logout);

router.post("/login", authController.login);
router.post("/register", isAdmin, authController.register);

export { router as authRouter };
