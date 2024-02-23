import { relations } from "drizzle-orm";
import { int, mysqlTable } from "drizzle-orm/mysql-core";

import { metaIntegrations } from "./metaIntegrations";
import { users } from "./users";

export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("owner_id"),
  metaIntegrationId: int("meta_integration_id"),
});

export const integrationsRelations = relations(integrations, ({ one }) => ({
  ownerId: one(users, {
    fields: [integrations.ownerId],
    references: [users.id],
  }),
  metaIntegrtionId: one(metaIntegrations, {
    fields: [integrations.ownerId],
    references: [metaIntegrations.id],
  }),
}));

export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
