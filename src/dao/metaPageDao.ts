import { eq } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { metaIntegrations, metaPages, NewMetaPage } from "#db/schema";

export const metaPageDao = {
  getUserPages: async (userId: number) => {
    const result = await planetScaleDB.query.metaIntegrations.findFirst({
      columns: {},
      with: {
        pages: true,
      },
      where: eq(metaIntegrations.ownerId, userId),
    });

    return result?.pages;
  },
  getPageAccessToken: async (pageId: number) => {
    const result = await planetScaleDB.query.metaPages.findFirst({
      columns: {
        accessToken: true,
      },
      where: eq(metaIntegrations.ownerId, pageId),
    });

    return result?.accessToken;
  },
  update: async (pageId: number, update: Partial<NewMetaPage>) => {
    await planetScaleDB
      .update(metaPages)
      .set(update)
      .where(eq(metaPages.pageId, pageId));
  },
  create: async (newMetaPage: NewMetaPage) => {
    const result = await planetScaleDB.insert(metaPages).values(newMetaPage);

    return result;
  },
};

export type MetaPageDao = typeof metaPageDao;
