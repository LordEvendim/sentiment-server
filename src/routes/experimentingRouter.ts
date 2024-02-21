import express, { Request, Response, Router } from "express";

import { isAdmin } from "#middleware/isAdmin";
import { gemini } from "#modules/gemini";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", isAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await gemini.getSampleResponse();

    res.send(result);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
