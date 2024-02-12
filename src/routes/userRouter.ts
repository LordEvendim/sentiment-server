import express, { Router } from "express";
import { isAdmin } from "src/middleware/isAdmin";

import { userController } from "#controller/userController";

const router: Router = express.Router();

router.get("/:userId", isAdmin, userController.getUserInfo);

export { router as userRouter };
