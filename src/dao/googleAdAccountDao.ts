import { and, eq, sql } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import {
  googleAdAccounts,
  googleIntegrations,
  NewGoogleAdAccount,
} from "#db/schema";

export const googleAdAccountDao = {
  isAccountOwner: async (userId: number, accountId: number) => {
    const result = await planetScaleDB.query.googleAdAccounts.findMany({
      where: eq(googleAdAccounts.id, accountId),
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
  getAccount: async (id: number, integrationId: number) => {
    const result = await planetScaleDB.query.googleAdAccounts.findFirst({
      where: and(
        eq(googleAdAccounts.id, id),
        eq(googleAdAccounts.integrationId, integrationId)
      ),
    });

    return result;
  },
  getUserAdAccounts: async (userId: number) => {
    const result = await planetScaleDB.query.googleIntegrations.findFirst({
      columns: {},
      with: {
        adAccounts: true,
      },
      where: eq(googleIntegrations.ownerId, userId),
    });

    return result?.adAccounts;
  },
  update: async (
    id: number,
    integrationId: number,
    update: Partial<NewGoogleAdAccount>
  ) => {
    await planetScaleDB
      .update(googleAdAccounts)
      .set(update)
      .where(
        and(
          eq(googleAdAccounts.id, id),
          eq(googleAdAccounts.integrationId, integrationId)
        )
      );
  },
  create: async (newGoogleAdAccount: NewGoogleAdAccount) => {
    const result = await planetScaleDB
      .insert(googleAdAccounts)
      .values(newGoogleAdAccount);

    return result;
  },
  createMany: async (newGoogleAdAccounts: NewGoogleAdAccount[]) => {
    const result = await planetScaleDB
      .insert(googleAdAccounts)
      .values(newGoogleAdAccounts)
      .onDuplicateKeyUpdate({
        set: {
          integrationId: sql`values(integration_id)`,
        },
      });

    return result;
  },
};

export type GoogleAdAccountDao = typeof googleAdAccountDao;
