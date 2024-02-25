import { Response } from "express";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { MetaPageInsightMetric } from "#db/schema";
import { MetaInsights, metaInsights } from "#modules/meta";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createMetaController = (metaInsights: MetaInsights) => {
  return {
    getUserPages: async (
      req: TypedRequest<object, object, { userId: number }>,
      res: Response<{
        pages:
          | {
              name: string;
              id: number;
            }[]
          | undefined;
        selectedPage: number | undefined;
      }>
    ) => {
      try {
        const userId = req.query.userId;

        if (!userId) throw new Error("Invlid request");

        const result = await metaInsights.getUserPages(userId);
        const selectedMetaPage =
          await metaIntegrationDao.getMetaIntegrationByUserId(userId);

        return res.status(200).send({
          pages: result,
          selectedPage: selectedMetaPage?.selectedPage ?? undefined,
        });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    selectPage: async (
      req: TypedRequest<{ userId: number; pageId: number }>,
      res: Response<number>
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
      req: TypedRequest<object, object, { userId: number; pageId: number }>,
      res: Response<Omit<MetaPageInsightMetric, "metricId">[]>
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
