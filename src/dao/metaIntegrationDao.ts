import { eq } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import {
  metaIntegrations,
  NewMetaIntegration,
} from "#db/schema/metaIntegrations";

export const metaIntegrationDao = {
  getAccessTokenByUserId: async (userId: number) => {
    const result = await mysqlDatabase.query.metaIntegrations.findFirst({
      columns: {
        accessToken: true,
      },
      where: eq(metaIntegrations.ownerId, userId),
    });

    return result?.accessToken;
  },
  getIntegrationWithSelectedByUserId: async (userId: number) => {
    const result = await mysqlDatabase.query.metaIntegrations.findFirst({
      with: {
        selectedPage: true,
        selectedAdAccount: true,
      },
      where: eq(metaIntegrations.ownerId, userId),
    });

    return result;
  },
  getIntegrationByUserId: async (userId: number) => {
    const result = await mysqlDatabase.query.metaIntegrations.findFirst({
      where: eq(metaIntegrations.ownerId, userId),
    });

    return result;
  },
  saveAccessToken: async (userId: number, accessToken: string) => {
    await mysqlDatabase
      .update(metaIntegrations)
      .set({ accessToken })
      .where(eq(metaIntegrations.ownerId, userId));
  },
  updateByUserId: async (
    userId: number,
    update: Partial<NewMetaIntegration>
  ) => {
    await mysqlDatabase
      .update(metaIntegrations)
      .set(update)
      .where(eq(metaIntegrations.ownerId, userId));
  },
  update: async (id: number, update: Partial<NewMetaIntegration>) => {
    await mysqlDatabase
      .update(metaIntegrations)
      .set(update)
      .where(eq(metaIntegrations.id, id));
  },
  create: async (newMetaIntegration: NewMetaIntegration) => {
    const result = await mysqlDatabase
      .insert(metaIntegrations)
      .values(newMetaIntegration)
      .onDuplicateKeyUpdate({
        set: newMetaIntegration,
      });

    return result;
  },
  deleteByUserId: async (userId: number) => {
    const result = await mysqlDatabase
      .delete(metaIntegrations)
      .where(eq(metaIntegrations.ownerId, userId));

    return result;
  },
};

export type MetaIntegrationDao = typeof metaIntegrationDao;
