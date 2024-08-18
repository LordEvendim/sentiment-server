import { relations } from "drizzle-orm";
import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { USER_ROLES } from "#modules/authorization/roles";

import { googleIntegrations } from "./googleIntegrations";
import { metaIntegrations } from "./metaIntegrations";
import { reports } from "./reports";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 60 }).unique().notNull(),
  fullName: varchar("full_name", { length: 256 }).notNull(),
  password: text("password").notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  credits: int("credits").default(0).notNull(),
  role: varchar("role", { length: 32 }).default(USER_ROLES.USER),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  metaIntegrations: one(metaIntegrations),
  googleIntegrations: one(googleIntegrations),
  reports: many(reports),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
