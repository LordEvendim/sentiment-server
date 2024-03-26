import { relations } from "drizzle-orm";
import {
  bigint,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";

import { googleAnalyticsMetrics } from "./googleAnalyticsMetrics";
import { googleIntegrations } from "./googleIntegrations";

export const googleAnalyticsPages = mysqlTable(
  "google_analytics_pages",
  {
    id: bigint("id", { mode: "number" }).notNull(),
    integrationId: int("integration_id").notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    parentAccountName: varchar("parent_account_name", {
      length: 256,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.integrationId] }),
  })
);

export const googleAnalyticsPagesRelations = relations(
  googleAnalyticsPages,
  ({ one, many }) => ({
    googleIntegration: one(googleIntegrations, {
      fields: [googleAnalyticsPages.integrationId],
      references: [googleIntegrations.id],
    }),
    metrics: many(googleAnalyticsMetrics),
  })
);

export type GoogleAnalyticsPage = typeof googleAnalyticsPages.$inferSelect;
export type GoogleAnalyticsDetails = Omit<
  GoogleAnalyticsPage,
  "accessToken" | "integrationId"
>;
export type NewGoogleAnalyticsPage = typeof googleAnalyticsPages.$inferInsert;
