import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { metaIntegrations } from "./metaIntegrations";
import { metaPageInsights } from "./metaPageInsights";

export const metaPages = mysqlTable("meta_pages", {
  pageId: bigint("page_id", { mode: "number" }).primaryKey(),
  integrationId: int("integration_id"),
  name: varchar("name", { length: 256 }).notNull(),
  profilePictureURL: varchar("profile_picture_url", { length: 256 }),
  accessToken: varchar("access_token", { length: 256 }).notNull(),
});

export const metaPagesRelations = relations(metaPages, ({ one, many }) => ({
  metaIntegration: one(metaIntegrations, {
    fields: [metaPages.integrationId],
    references: [metaIntegrations.id],
  }),
  metaPageInsights: many(metaPageInsights),
}));

export type MetaPage = typeof metaPages.$inferSelect;
export type MetaPageDetails = Omit<MetaPage, "accessToken" | "integrationId">;
export type NewMetaPage = typeof metaPages.$inferInsert;
