import { eq, sql } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { metaIntegrations, metaPages, NewMetaPage } from "#db/schema";

export const metaPageDao = {
  isPageOwner: async (userId: number, pageId: number) => {
    const result = await planetScaleDB.query.metaPages.findMany({
      where: eq(metaPages.pageId, pageId),
      with: {
        metaIntegration: {
          // TODO: replace with sql query
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          where: eq(metaIntegrations.ownerId, userId),
        },
      },
    });

    return Boolean(result.length > 0);
  },
  getPageByPageId: async (pageId: number) => {
    const result = await planetScaleDB.query.metaPages.findFirst({
      where: eq(metaPages.pageId, pageId),
    });

    return result;
  },
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
      where: eq(metaPages.pageId, pageId),
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
  createMany: async (newMetaPage: NewMetaPage[]) => {
    const result = await planetScaleDB
      .insert(metaPages)
      .values(newMetaPage)
      .onDuplicateKeyUpdate({
        set: {
          accessToken: sql`values(access_token)`,
          integrationId: sql`values(integration_id)`,
          name: sql`values(name)`,
          profilePictureURL: sql`values(profile_picture_url)`,
        },
      });

    return result;
  },
};

export type MetaPageDao = typeof metaPageDao;
