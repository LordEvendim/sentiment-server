import { eq } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { googleIntegrations, NewGoogleIntegration } from "#db/schema";
import { metaIntegrations } from "#db/schema/metaIntegrations";

export const metaIntegrationDao = {
  getAccessTokenByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.googleIntegrations.findFirst({
      columns: {
        accessToken: true,
      },
      where: eq(metaIntegrations.ownerId, userId),
    });

    return result?.accessToken;
  },
  getMetaIntegrationByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.googleIntegrations.findFirst({
      where: eq(metaIntegrations.ownerId, userId),
    });

    return result;
  },
  saveAccessToken: async (userId: number, accessToken: string) => {
    await planetScaleDB
      .update(googleIntegrations)
      .set({ accessToken })
      .where(eq(googleIntegrations.ownerId, userId));
  },
  update: async (userId: number, update: Partial<NewGoogleIntegration>) => {
    await planetScaleDB
      .update(googleIntegrations)
      .set(update)
      .where(eq(googleIntegrations.ownerId, userId));
  },
  create: async (newGoogleIntegration: NewGoogleIntegration) => {
    const result = await planetScaleDB
      .insert(googleIntegrations)
      .values(newGoogleIntegration);

    return result;
  },
};

export type MetaIntegrationDao = typeof metaIntegrationDao;
