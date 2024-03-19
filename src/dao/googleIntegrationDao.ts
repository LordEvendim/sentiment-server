import { eq } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { googleIntegrations, NewGoogleIntegration } from "#db/schema";

export const googleIntegrationDao = {
  getAccessTokenByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.googleIntegrations.findFirst({
      columns: {
        accessToken: true,
      },
      where: eq(googleIntegrations.ownerId, userId),
    });

    return result?.accessToken;
  },
  getIntegrationByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.googleIntegrations.findFirst({
      where: eq(googleIntegrations.ownerId, userId),
    });

    return result;
  },
  getIntegrationWithSelectedByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.googleIntegrations.findFirst({
      with: {
        selectedPage: true,
        selectedAdAccount: true,
      },
      where: eq(googleIntegrations.ownerId, userId),
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
      .values(newGoogleIntegration)
      .onDuplicateKeyUpdate({
        set: newGoogleIntegration,
      });

    return result;
  },
};

export type GoogleIntegrationDao = typeof googleIntegrationDao;
