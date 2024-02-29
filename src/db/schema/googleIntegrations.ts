import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { users } from "./users";

export const googleIntegrations = mysqlTable("google_integrations", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("owner_id").unique().notNull(),
  accessToken: varchar("access_token", { length: 512 }),
  refreshToken: varchar("refresh_token", { length: 512 }),
  tokenCreatedAt: bigint("token_created_at", { mode: "number" }),
});

export const googleIntegrationsRelations = relations(
  googleIntegrations,
  ({ one }) => ({
    owner: one(users, {
      fields: [googleIntegrations.ownerId],
      references: [users.id],
    }),
  })
);

export type GoogleIntegration = typeof googleIntegrations.$inferSelect;
export type NewGoogleIntegration = typeof googleIntegrations.$inferInsert;
