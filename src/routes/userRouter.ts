import express, { Router } from "express";
import { isAdmin } from "src/middleware/isAdmin";

import { userController } from "#controller/userController";
import { isAuthenticated } from "#middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/credits", isAuthenticated, userController.getUserCredits);

router.post("/reset-password", userController.resetPassword);
router.post("/password", userController.setPassword);

router.get("/:userId", isAdmin, userController.getUserInfo);

export { router as userRouter };
