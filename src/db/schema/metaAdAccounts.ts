import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { metaIntegrations } from "./metaIntegrations";

export const metaAdAccounts = mysqlTable("meta_ad_accounts", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  integrationId: int("integration_id"),
  parentAccountName: varchar("parent_account_name", { length: 256 }),
});

export const metaAdAccountsRelations = relations(metaAdAccounts, ({ one }) => ({
  metaIntegration: one(metaIntegrations, {
    fields: [metaAdAccounts.integrationId],
    references: [metaIntegrations.id],
  }),
}));

export type MetaAdAccount = typeof metaAdAccounts.$inferSelect;
export type MetaAdAccountDetails = Omit<MetaAdAccount, "integrationId">;
export type NewMetaAdAccount = typeof metaAdAccounts.$inferInsert;
