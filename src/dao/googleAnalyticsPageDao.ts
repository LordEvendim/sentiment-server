import { eq } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import {
  googleAnalyticsPages,
  googleIntegrations,
  NewGoogleAnalyticsPage,
} from "#db/schema";

export const googleAnalyticsPageDao = {
  isPageOwner: async (userId: number, pageId: number) => {
    const result = await planetScaleDB.query.googleAnalyticsPages.findMany({
      where: eq(googleAnalyticsPages.id, pageId),
      with: {
        googleIntegration: {
          // TODO: replace with sql query
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          where: eq(googleIntegrations.ownerId, userId),
        },
      },
    });

    return Boolean(result.length > 0);
  },
  getPageById: async (pageId: number) => {
    const result = await planetScaleDB.query.googleAnalyticsPages.findFirst({
      where: eq(googleAnalyticsPages.id, pageId),
    });

    return result;
  },
  getUserPages: async (userId: number) => {
    const result = await planetScaleDB.query.googleIntegrations.findFirst({
      columns: {},
      with: {
        analyticsPages: true,
      },
      where: eq(googleIntegrations.ownerId, userId),
    });

    return result?.analyticsPages;
  },
  update: async (id: number, update: Partial<NewGoogleAnalyticsPage>) => {
    await planetScaleDB
      .update(googleAnalyticsPages)
      .set(update)
      .where(eq(googleAnalyticsPages.id, id));
  },
  create: async (newGoogleAnalyticsPage: NewGoogleAnalyticsPage) => {
    const result = await planetScaleDB
      .insert(googleAnalyticsPages)
      .values(newGoogleAnalyticsPage);

    return result;
  },
  createMany: async (newGoogleAnalyticsPages: NewGoogleAnalyticsPage[]) => {
    const result = await planetScaleDB
      .insert(googleAnalyticsPages)
      .values(newGoogleAnalyticsPages);

    return result;
  },
};

export type GoogleAnalyticsPageDao = typeof googleAnalyticsPageDao;
