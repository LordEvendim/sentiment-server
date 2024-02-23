import express, { Request, Response, Router } from "express";

import { isAdmin } from "#middleware/isAdmin";
import { queueProducer } from "#modules/message-broker";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", isAdmin, async (_req: Request, res: Response) => {
  try {
    queueProducer.sendMessage();

    res.send({});
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
