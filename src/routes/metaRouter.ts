import express, { Router } from "express";

import { metaController } from "#controller/metaController";

const router: Router = express.Router();

router.get("/accounts", metaController.getUserPages);

router.post("/selected-page", metaController.selectPage);

export { router as metaRouter };
