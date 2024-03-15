import express, { Request, Response, Router } from "express";

import { isAdmin } from "#middleware/isAdmin";
import { metaInsights } from "#modules/meta";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.send("Error");

    const accounts = await metaInsights.connectUserAdAccounts(
      parseInt(userId.toString())
    );

    res.send(accounts);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
