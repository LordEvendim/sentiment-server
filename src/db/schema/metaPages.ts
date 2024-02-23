import { relations } from "drizzle-orm";
import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { metaIntegrations } from "./metaIntegrations";
import { metaPageInsights } from "./metaPageInsights";

export const metaPages = mysqlTable("meta_pages", {
  pageId: int("page_id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  profilePictureURL: varchar("profile_picture_url", { length: 256 }),
  accessToken: varchar("access_token", { length: 256 }).notNull(),
});

export const metaPagesRelations = relations(metaPages, ({ one, many }) => ({
  metaIntegrations: one(metaIntegrations),
  metaPageInsights: many(metaPageInsights),
}));

export type MetaPage = typeof metaPages.$inferSelect;
export type NewMetaPage = typeof metaPages.$inferInsert;
