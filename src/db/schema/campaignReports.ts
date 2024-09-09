import { relations } from "drizzle-orm";
import {
  date,
  datetime,
  int,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

import { users } from "./users";

export const campaignReports = mysqlTable("campaign_reports", {
  reportId: int("report_id").primaryKey().autoincrement(),
  createdAt: datetime("created_at").notNull(),
  timeframe: varchar("timeframe", { length: 30 }).notNull(),
  until: date("until").notNull(),
  data: text("data").notNull(),
  ownerId: int("owner_id").notNull(),
});

export const reportsRelations = relations(campaignReports, ({ one }) => ({
  owner: one(users, {
    fields: [campaignReports.ownerId],
    references: [users.id],
  }),
}));

export type CampaignReport = typeof campaignReports.$inferSelect;
export type NewCampaignReport = typeof campaignReports.$inferInsert;
