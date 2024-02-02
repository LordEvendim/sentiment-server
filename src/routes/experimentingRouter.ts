import express, { Request, Response, Router } from "express";

import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  try {
    res.send("Hello world!!!");
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
