import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable } from "drizzle-orm/mysql-core";

import { metaPageInsightMetrics } from "./metaPageInsightMetrics";
import { metaPages } from "./metaPages";

export const metaPageInsights = mysqlTable("meta_page_insights", {
  insightId: int("insight_id").primaryKey().autoincrement(),
  pageId: bigint("page_id", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" }),
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
