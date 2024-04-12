import { and, eq, sql } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import {
  googleAnalyticsPages,
  googleIntegrations,
  NewGoogleAnalyticsPage,
} from "#db/schema";

export const googleAnalyticsPageDao = {
  isPageOwner: async (userId: number, pageId: number) => {
    const result = await mysqlDatabase.query.googleAnalyticsPages.findMany({
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
  getPage: async (id: number, integrationId: number) => {
    const result = await mysqlDatabase.query.googleAnalyticsPages.findFirst({
      where: and(
        eq(googleAnalyticsPages.id, id),
        eq(googleAnalyticsPages.integrationId, integrationId)
      ),
    });

    return result;
  },
  getUserPages: async (userId: number) => {
    const result = await mysqlDatabase.query.googleIntegrations.findFirst({
      columns: {},
      with: {
        analyticsPages: true,
      },
      where: eq(googleIntegrations.ownerId, userId),
    });

    return result?.analyticsPages;
  },
  update: async (
    id: number,
    integrationId: number,
    update: Partial<NewGoogleAnalyticsPage>
  ) => {
    await mysqlDatabase
      .update(googleAnalyticsPages)
      .set(update)
      .where(
        and(
          eq(googleAnalyticsPages.id, id),
          eq(googleAnalyticsPages.integrationId, integrationId)
        )
      );
  },
  create: async (newGoogleAnalyticsPage: NewGoogleAnalyticsPage) => {
    const result = await mysqlDatabase
      .insert(googleAnalyticsPages)
      .values(newGoogleAnalyticsPage);

    return result;
  },
  createMany: async (newGoogleAnalyticsPages: NewGoogleAnalyticsPage[]) => {
    const result = await mysqlDatabase
      .insert(googleAnalyticsPages)
      .values(newGoogleAnalyticsPages)
      .onDuplicateKeyUpdate({
        set: {
          name: sql`values(name)`,
          parentAccountName: sql`values(parent_account_name)`,
        },
      });

    return result;
  },
};

export type GoogleAnalyticsPageDao = typeof googleAnalyticsPageDao;
