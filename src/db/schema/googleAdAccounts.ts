import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable, primaryKey } from "drizzle-orm/mysql-core";

import { googleIntegrations } from "./googleIntegrations";

export const googleAdAccounts = mysqlTable(
  "google_ad_accounts",
  {
    id: bigint("id", { mode: "number" }).notNull(),
    integrationId: int("integration_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.integrationId] }),
  })
);

export const googleAdAccountsRelations = relations(
  googleAdAccounts,
  ({ one }) => ({
    googleIntegration: one(googleIntegrations, {
      fields: [googleAdAccounts.integrationId],
      references: [googleIntegrations.id],
    }),
  })
);

export type GoogleAdAccount = typeof googleAdAccounts.$inferSelect;
export type GoogleAdAccountDetails = Omit<GoogleAdAccount, "integrationId">;
export type NewGoogleAdAccount = typeof googleAdAccounts.$inferInsert;
