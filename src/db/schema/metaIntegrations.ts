import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { metaPages } from "./metaPages";
import { users } from "./users";

export const metaIntegrations = mysqlTable("meta_integrations", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("owner_id").unique().notNull(),
  metaId: varchar("metaId", { length: 60 }).notNull(),
  fullName: varchar("full_name", { length: 256 }),
  email: varchar("email", { length: 256 }),
  accessToken: varchar("access_token", { length: 512 }),
  tokenCreatedAt: varchar("token_created_at", { length: 30 }),
  selectedPage: bigint("selected_page", { mode: "number" }),
});

export const metaIntegrationsRelations = relations(
  metaIntegrations,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [metaIntegrations.ownerId],
      references: [users.id],
    }),
    pages: many(metaPages),
    selectedPage: one(metaPages, {
      fields: [metaIntegrations.selectedPage],
      references: [metaPages.pageId],
    }),
  })
);

export type MetaIntegration = typeof metaIntegrations.$inferSelect;
export type NewMetaIntegration = typeof metaIntegrations.$inferInsert;
