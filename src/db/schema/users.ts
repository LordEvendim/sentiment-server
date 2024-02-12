import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 60 }).unique().notNull(),
  fullName: varchar("full_name", { length: 256 }).notNull(),
  password: text("password").notNull(),
  email: varchar("email", { length: 256 }).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
