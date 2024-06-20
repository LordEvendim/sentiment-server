import { eq } from "drizzle-orm";
import { Credentials } from "google-auth-library";

import { mysqlDatabase } from "#db/mysql";
import { googleIntegrations, NewGoogleIntegration } from "#db/schema";

export const googleIntegrationDao = {
  getAccessTokenByUserId: async (userId: number) => {
    const result = await mysqlDatabase.query.googleIntegrations.findFirst({
      columns: {
        accessToken: true,
      },
      where: eq(googleIntegrations.ownerId, userId),
    });

    return result?.accessToken;
  },
  getIntegrationByUserId: async (userId: number) => {
    const result = await mysqlDatabase.query.googleIntegrations.findFirst({
      where: eq(googleIntegrations.ownerId, userId),
    });

    return result;
  },
  getIntegrationWithSelectedByUserId: async (userId: number) => {
    const result = await mysqlDatabase.query.googleIntegrations.findFirst({
      with: {
        selectedPage: true,
        selectedAdAccount: true,
      },
      where: eq(googleIntegrations.ownerId, userId),
    });

    return result;
  },
  saveAccessToken: async (userId: number, accessToken: string) => {
    await mysqlDatabase
      .update(googleIntegrations)
      .set({ accessToken })
      .where(eq(googleIntegrations.ownerId, userId));
  },
  updateByUserId: async (
    userId: number,
    update: Partial<NewGoogleIntegration>
  ) => {
    await mysqlDatabase
      .update(googleIntegrations)
      .set(update)
      .where(eq(googleIntegrations.ownerId, userId));
  },
  update: async (id: number, update: Partial<NewGoogleIntegration>) => {
    await mysqlDatabase
      .update(googleIntegrations)
      .set(update)
      .where(eq(googleIntegrations.id, id));
  },
  create: async (newGoogleIntegration: NewGoogleIntegration) => {
    const result = await mysqlDatabase
      .insert(googleIntegrations)
      .values(newGoogleIntegration)
      .onDuplicateKeyUpdate({
        set: newGoogleIntegration,
      });

    return result;
  },
  saveTokens: async function (userId: number, tokens: Credentials) {
    return await googleIntegrationDao.create({
      ownerId: userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiryDate: tokens.expiry_date,
      tokenCreatedAt: Date.now(),
    });
  },
  loadTokens: async function (userId: number) {
    const result = await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!result || !result.accessToken || !result.refreshToken) return null;

    return {
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      expiry_date: result.accessTokenExpiryDate,
    } as const;
  },
  deleteByUserId: async (userId: number) => {
    const result = await mysqlDatabase
      .delete(googleIntegrations)
      .where(eq(googleIntegrations.ownerId, userId));

    return result;
  },
};

export type GoogleIntegrationDao = typeof googleIntegrationDao;
