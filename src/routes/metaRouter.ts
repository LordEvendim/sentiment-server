import express, { Router } from "express";

import { metaController } from "#controller/metaController";

const router: Router = express.Router();

router.get("/accounts", metaController.getUserPages);

export { router as metaRouter };
