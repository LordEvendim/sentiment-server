import { Response } from "express";

import { handleControllerError } from "#utils/errorHandling";
import { MetaInsights, metaInsights } from "#modules/meta";
import { TypedRequest } from "#types/express";

const createMetaController = (metaInsights: MetaInsights) => {
  return {
    getUserPages: async (
      req: TypedRequest<{}, {}, { userId: string }>,
      res: Response<
        {
          name: string;
          id: string;
        }[]
      >
    ) => {
      try {
        const userId = req.query.userId;

        if (!userId) throw new Error("Invlid request");

        console.log("getting accounts");

        const result = await metaInsights.getAccounts(userId);

        console.log(result);

        return res.status(200).send(result);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const metaController = createMetaController(metaInsights);
