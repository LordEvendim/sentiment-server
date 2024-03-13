import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { googleIntegrations } from "./googleIntegrations";

export const googleAnalyticsPages = mysqlTable("google_analytics_pages", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  integrationId: int("integration_id"),
  name: varchar("name", { length: 256 }).notNull(),
  parentAccountName: varchar("parent_account_name", { length: 256 }).notNull(),
});

export const googleAnalyticsPagesRelations = relations(
  googleAnalyticsPages,
  ({ one }) => ({
    googleIntegration: one(googleIntegrations, {
      fields: [googleAnalyticsPages.integrationId],
      references: [googleIntegrations.id],
    }),
  })
);

export type GoogleAnalyticsPage = typeof googleAnalyticsPages.$inferSelect;
export type GoogleAnalyticsDetails = Omit<
  GoogleAnalyticsPage,
  "accessToken" | "integrationId"
>;
export type NewGoogleAnalyticsPage = typeof googleAnalyticsPages.$inferInsert;
