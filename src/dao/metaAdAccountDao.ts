import { eq, sql } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { metaAdAccounts, metaIntegrations, NewMetaAdAccount } from "#db/schema";

export const metaAdAccountDao = {
  isAccountOwner: async (userId: number, accountId: number) => {
    const result = await planetScaleDB.query.metaAdAccounts.findMany({
      where: eq(metaAdAccounts.id, accountId),
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
  getAccountById: async (id: number) => {
    const result = await planetScaleDB.query.metaAdAccounts.findFirst({
      where: eq(metaAdAccounts.id, id),
    });

    return result;
  },
  getUserAdAccounts: async (userId: number) => {
    const result = await planetScaleDB.query.metaIntegrations.findFirst({
      columns: {},
      with: {
        adAccounts: true,
      },
      where: eq(metaIntegrations.ownerId, userId),
    });

    return result?.adAccounts;
  },
  update: async (id: number, update: Partial<NewMetaAdAccount>) => {
    await planetScaleDB
      .update(metaAdAccounts)
      .set(update)
      .where(eq(metaAdAccounts.id, id));
  },
  create: async (newMetaAdAccount: NewMetaAdAccount) => {
    const result = await planetScaleDB
      .insert(metaAdAccounts)
      .values(newMetaAdAccount);

    return result;
  },
  createMany: async (newMetaAdAccounts: NewMetaAdAccount[]) => {
    const result = await planetScaleDB
      .insert(metaAdAccounts)
      .values(newMetaAdAccounts)
      .onDuplicateKeyUpdate({
        set: {
          integrationId: sql`values(integration_id)`,
          parentAccountName: sql`values(parent_account_name)`,
        },
      });

    return result;
  },
};

export type MetaAdAccountDao = typeof metaAdAccountDao;
