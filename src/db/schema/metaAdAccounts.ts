import { relations } from "drizzle-orm";
import {
  bigint,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";

import { metaIntegrations } from "./metaIntegrations";

export const metaAdAccounts = mysqlTable(
  "meta_ad_accounts",
  {
    id: bigint("id", { mode: "number" }).notNull(),
    integrationId: int("integration_id").notNull(),
    parentAccountName: varchar("parent_account_name", {
      length: 256,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.integrationId] }),
  })
);

export const metaAdAccountsRelations = relations(metaAdAccounts, ({ one }) => ({
  metaIntegration: one(metaIntegrations, {
    fields: [metaAdAccounts.integrationId],
    references: [metaIntegrations.id],
  }),
}));

export type MetaAdAccount = typeof metaAdAccounts.$inferSelect;
export type MetaAdAccountDetails = Omit<MetaAdAccount, "integrationId">;
export type NewMetaAdAccount = typeof metaAdAccounts.$inferInsert;
