import express, { Request, Response, Router } from "express";

import { gemini } from "#modules/gemini";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await gemini.testResponse();

    res.send(result);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
