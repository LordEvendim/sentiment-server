import { relations } from "drizzle-orm";
import { int, mysqlTable } from "drizzle-orm/mysql-core";

import { metaPageInsightMetrics } from "./metaPageInsightMetrics";
import { metaPages } from "./metaPages";

export const metaPageInsights = mysqlTable("meta_page_insights", {
  insightId: int("insight_id").primaryKey().autoincrement(),
  pageId: int("page_id"),
  createdAt: int("created_at"),
});

export const metaPageInsightsRelations = relations(
  metaPageInsights,
  ({ one, many }) => ({
    pageId: one(metaPages, {
      fields: [metaPageInsights.pageId],
      references: [metaPages.pageId],
    }),
    metrics: many(metaPageInsightMetrics),
  })
);

export type MetaPageInsight = typeof metaPageInsights.$inferSelect;
export type NewMetaPageInsight = typeof metaPageInsights.$inferInsert;
