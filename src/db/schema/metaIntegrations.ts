import { relations } from "drizzle-orm";
import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { users } from "./users";

export const metaIntegrations = mysqlTable("meta_integrations", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("owner_id").notNull(),
  metaId: varchar("metaId", { length: 60 }).unique().notNull(),
  fullName: varchar("full_name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  accessToken: varchar("access_token", { length: 512 }),
});

export const metaIntegrationsRelations = relations(
  metaIntegrations,
  ({ one }) => ({
    owner: one(users, {
      fields: [metaIntegrations.ownerId],
      references: [users.id],
    }),
  })
);

export type MetaIntegration = typeof metaIntegrations.$inferSelect;
export type NewMetaIntegration = typeof metaIntegrations.$inferInsert;
