import { relations } from "drizzle-orm";
import {
  bigint,
  date,
  double,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";

import { googleAdAccounts } from "./googleAdAccounts";

export const googleSearchTerms = mysqlTable(
  "google_search_terms",
  {
    searchTerm: varchar("search_term", { length: 256 }).notNull(),
    adGroupId: varchar("ad_group_id", { length: 256 }).notNull(),
    sourceId: bigint("source_id", { mode: "number" }).notNull(),
    integrationId: bigint("integration_id", { mode: "number" }).notNull(),
    createdAt: date("created_at").notNull(),
    spend: double("spend", { scale: 4 }),
    ctr: double("ctr", { scale: 4 }),
    clicks: int("clicks"),
    impressions: int("impressions"),
  },
  (table) => ({
    pk: primaryKey({
      name: "pk_google_search_terms",
      columns: [
        table.searchTerm,
        table.createdAt,
        table.sourceId,
        table.integrationId,
      ],
    }),
  })
);

export const googleSearchTermsRelations = relations(
  googleSearchTerms,
  ({ one }) => ({
    source: one(googleAdAccounts, {
      fields: [googleSearchTerms.sourceId, googleSearchTerms.integrationId],
      references: [googleAdAccounts.id, googleAdAccounts.integrationId],
    }),
  })
);

export type GoogleSearchTerm = typeof googleSearchTerms.$inferSelect;
export type NewGoogleSearchTerm = typeof googleSearchTerms.$inferInsert;
