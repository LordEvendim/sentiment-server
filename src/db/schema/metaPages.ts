import { relations } from "drizzle-orm";
import {
  bigint,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";

import { metaIntegrations } from "./metaIntegrations";

export const metaPages = mysqlTable(
  "meta_pages",
  {
    pageId: bigint("page_id", { mode: "number" }).notNull(),
    integrationId: int("integration_id").notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    profilePictureURL: varchar("profile_picture_url", { length: 256 }),
    accessToken: varchar("access_token", { length: 256 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.pageId, table.integrationId] }),
  })
);

export const metaPagesRelations = relations(metaPages, ({ one }) => ({
  metaIntegration: one(metaIntegrations, {
    fields: [metaPages.integrationId],
    references: [metaIntegrations.id],
  }),
}));

export type MetaPage = typeof metaPages.$inferSelect;
export type MetaPageDetails = Omit<MetaPage, "accessToken" | "integrationId">;
export type NewMetaPage = typeof metaPages.$inferInsert;
