import { relations } from "drizzle-orm";
import {
  bigint,
  date,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";

import { googleAnalyticsPages } from "./googleAnalyticsPages";

export const googleAnalyticsSources = mysqlTable(
  "google_analytics_sources",
  {
    source: varchar("source", { length: 256 }).notNull(), // this source refers to the source of the traffic not the analytics page
    sourceId: bigint("source_id", { mode: "number" }).notNull(),
    createdAt: date("created_at").notNull(),
    integrationId: bigint("integration_id", { mode: "number" }).notNull(),
    sessions: int("sessions").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      name: "pk_google_analytics_sources",
      columns: [
        table.source,
        table.sourceId,
        table.createdAt,
        table.integrationId,
      ],
    }),
  })
);

export const googleAnalyticsSourcesRelations = relations(
  googleAnalyticsSources,
  ({ one }) => ({
    source: one(googleAnalyticsPages, {
      fields: [
        googleAnalyticsSources.sourceId,
        googleAnalyticsSources.integrationId,
      ],
      references: [googleAnalyticsPages.id, googleAnalyticsPages.integrationId],
    }),
  })
);

export type GoogleAnalyticsSources = typeof googleAnalyticsSources.$inferSelect;
export type NewGoogleAnalyticsSources =
  typeof googleAnalyticsSources.$inferInsert;
