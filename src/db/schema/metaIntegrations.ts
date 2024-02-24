import { relations } from "drizzle-orm";
import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { integrations } from "./integrations";

export const metaIntegrations = mysqlTable("meta_integrations", {
  id: int("id").autoincrement().primaryKey(),
  metaId: varchar("metaId", { length: 60 }).unique().notNull(),
  fullName: varchar("full_name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  accessToken: varchar("access_token", { length: 512 }),
});

export const metaIntegrationsRelations = relations(
  metaIntegrations,
  ({ one }) => ({
    integrations: one(integrations),
  })
);

export type MetaIntegration = typeof metaIntegrations.$inferSelect;
export type NewMetaIntegration = typeof metaIntegrations.$inferInsert;
