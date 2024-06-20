import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { googleAdAccounts } from "./googleAdAccounts";
import { googleAnalyticsPages } from "./googleAnalyticsPages";
import { users } from "./users";

export const googleIntegrations = mysqlTable("google_integrations", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("owner_id").unique().notNull(),
  accessToken: varchar("access_token", { length: 512 }),
  refreshToken: varchar("refresh_token", { length: 512 }),
  tokenCreatedAt: bigint("token_created_at", { mode: "number" }),
  accessTokenExpiryDate: bigint("acess_token_expiry_date", { mode: "number" }),
  selectedPage: bigint("selected_page", { mode: "number" }),
  selectedAdAccount: bigint("selected_ad_account", { mode: "number" }),
});

export const googleIntegrationsRelations = relations(
  googleIntegrations,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [googleIntegrations.ownerId],
      references: [users.id],
    }),
    selectedPage: one(googleAnalyticsPages, {
      fields: [googleIntegrations.selectedPage],
      references: [googleAnalyticsPages.id],
    }),
    selectedAdAccount: one(googleAdAccounts, {
      fields: [googleIntegrations.selectedAdAccount],
      references: [googleAdAccounts.id],
    }),
    analyticsPages: many(googleAnalyticsPages),
    adAccounts: many(googleAdAccounts),
  })
);

export type GoogleIntegration = typeof googleIntegrations.$inferSelect;
export type NewGoogleIntegration = typeof googleIntegrations.$inferInsert;
