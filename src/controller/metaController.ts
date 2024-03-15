import { Response } from "express";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import {
  MetaIntegration,
  MetaPageDetails,
  MetaPageInsightMetric,
} from "#db/schema";
import { MetaInsights, metaInsights } from "#modules/meta";
import { metaAuth } from "#modules/meta/metaAuth";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createMetaController = (metaInsights: MetaInsights) => {
  return {
    getUserPages: async (
      req: TypedRequest<object, object, object>,
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
        const userId = req.session.user?.id;

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
      req: TypedRequest<{ pageId: number }>,
      res: Response<{ selectedPage: number }>
    ) => {
      try {
        const { pageId } = req.body;
        const userId = req.session.user?.id;

        if (!userId || !pageId) throw new Error("Invlid request");

        const result = await metaInsights.selectPage(userId, pageId);

        return res.status(200).send({ selectedPage: result });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getPageInsights: async (
      req: TypedRequest<object, object, { pageId: number }>,
      res: Response<Omit<MetaPageInsightMetric, "metricId">[]>
    ) => {
      try {
        const { pageId } = req.query;
        const userId = req.session.user?.id;

        if (!userId || !pageId) throw new Error("Invlid request");

        const result = await metaInsights.getPageInsights(userId, pageId);

        return res.status(200).send(result);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getUserIntegration: async (
      req: TypedRequest<object, object, object>,
      res: Response<
        | (Omit<MetaIntegration, "selectedPage"> & {
            selectedPage?: MetaPageDetails;
          })
        | undefined
      >
    ) => {
      try {
        const userId = req.session.user?.id;

        if (!userId) throw new Error("Invlid request");

        const result = await metaInsights.getUserIntegration(userId);

        return res.status(200).send(result);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    createAccessToken: async (
      req: TypedRequest<
        { accessToken: string; metaId: string },
        object,
        object
      >,
      res: Response
    ) => {
      try {
        const token = req.body.accessToken;
        const metaId = req.body.metaId;
        const userId = req.session.user?.id;

        if (!token || !metaId || !userId) throw new Error("Invalid request");

        const longLivedToken = await metaAuth.createAccessToken(
          userId,
          metaId,
          token
        );

        return res.status(200).send(longLivedToken);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const metaController = createMetaController(metaInsights);
