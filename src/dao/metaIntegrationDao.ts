import { eq } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import {
  metaIntegrations,
  NewMetaIntegration,
} from "#db/schema/metaIntegrations";

export const metaIntegrationDao = {
  getAccessTokenByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.metaIntegrations.findFirst({
      columns: {
        accessToken: true,
      },
      where: eq(metaIntegrations.ownerId, userId),
    });

    return result?.accessToken;
  },
  getIntegrationWithSelectedPageByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.metaIntegrations.findFirst({
      with: {
        selectedPage: true,
      },
      where: eq(metaIntegrations.ownerId, userId),
    });

    return result;
  },
  getMetaIntegrationByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.metaIntegrations.findFirst({
      where: eq(metaIntegrations.ownerId, userId),
    });

    return result;
  },
  saveAccessToken: async (userId: number, accessToken: string) => {
    await planetScaleDB
      .update(metaIntegrations)
      .set({ accessToken })
      .where(eq(metaIntegrations.ownerId, userId));
  },
  update: async (userId: number, update: Partial<NewMetaIntegration>) => {
    await planetScaleDB
      .update(metaIntegrations)
      .set(update)
      .where(eq(metaIntegrations.ownerId, userId));
  },
  create: async (newMetaIntegration: NewMetaIntegration) => {
    const result = await planetScaleDB
      .insert(metaIntegrations)
      .values(newMetaIntegration)
      .onDuplicateKeyUpdate({
        set: newMetaIntegration,
      });

    return result;
  },
};

export type MetaIntegrationDao = typeof metaIntegrationDao;
