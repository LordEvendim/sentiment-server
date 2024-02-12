import { Response } from "express";

import { MetaInsights, metaInsights } from "#modules/meta";
import { selectedUserPage } from "#modules/meta/tempStorage";
import { PageInsights } from "#modules/meta/types";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createMetaController = (metaInsights: MetaInsights) => {
  return {
    getUserPages: async (
      req: TypedRequest<object, object, { userId: string }>,
      res: Response<{
        pages:
          | {
              name: string;
              id: string;
            }[]
          | undefined;
        selectedPage: string;
      }>
    ) => {
      try {
        const userId = req.query.userId;

        if (!userId) throw new Error("Invlid request");

        const result = await metaInsights.getAccounts(userId);

        return res.status(200).send({
          pages: result,
          selectedPage: selectedUserPage[userId],
        });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    selectPage: async (
      req: TypedRequest<{ userId: string; pageId: string }>,
      res: Response<string>
    ) => {
      try {
        const { pageId, userId } = req.body;

        if (!userId || !pageId) throw new Error("Invlid request");

        const result = await metaInsights.selectPage(userId, pageId);

        return res.status(200).send(result);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getPageInsights: async (
      req: TypedRequest<object, object, { userId: string; pageId: string }>,
      res: Response<PageInsights>
    ) => {
      try {
        const { pageId, userId } = req.query;

        if (!userId || !pageId) throw new Error("Invlid request");

        const result = await metaInsights.getPageInsights(userId, pageId);

        return res.status(200).send(result);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const metaController = createMetaController(metaInsights);
