import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { googleAnalyticsPages } from "./googleAnalyticsPages";
import { users } from "./users";

export const googleIntegrations = mysqlTable("google_integrations", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("owner_id").unique().notNull(),
  accessToken: varchar("access_token", { length: 512 }),
  refreshToken: varchar("refresh_token", { length: 512 }),
  tokenCreatedAt: bigint("token_created_at", { mode: "number" }),
  selectedPage: bigint("selected_page", { mode: "number" }),
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
    analyticsPages: many(googleAnalyticsPages),
  })
);

export type GoogleIntegration = typeof googleIntegrations.$inferSelect;
export type NewGoogleIntegration = typeof googleIntegrations.$inferInsert;
