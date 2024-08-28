import { and, eq, gte, sql } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import {
  GoogleSearchTerm,
  googleSearchTerms,
  NewGoogleSearchTerm,
} from "#db/schema/googleSearchTerms";

export const googleSearchTermDao = {
  getSummary: async (accountId: number, integrationId: number, since: Date) => {
    const result = await mysqlDatabase.execute(
      sql`
      select
        ANY_VALUE(${googleSearchTerms.searchTerm}) as searchTerm, 
        ANY_VALUE(${googleSearchTerms.adGroupId}) as adGroupId,
        SUM(${googleSearchTerms.clicks}) as clicks, 
        SUM(${googleSearchTerms.impressions}) as impressions,
        SUM(${googleSearchTerms.spend}) as spend
      from ${googleSearchTerms}
      where ${googleSearchTerms.sourceId} = ${accountId} and ${googleSearchTerms.integrationId} = ${integrationId} and ${googleSearchTerms.createdAt} >= ${since}
      group by ${googleSearchTerms.searchTerm}
      `
    );

    return (result[0] ?? []) as unknown as GoogleSearchTerm[];
  },
  getSummarySinceUntil: async (
    accountId: number,
    integrationId: number,
    since: Date,
    until: Date
  ) => {
    const result = await mysqlDatabase.execute(
      sql`
      select
        ANY_VALUE(${googleSearchTerms.searchTerm}) as searchTerm, 
        ANY_VALUE(${googleSearchTerms.adGroupId}) as adGroupId,
        SUM(${googleSearchTerms.clicks}) as clicks, 
        SUM(${googleSearchTerms.impressions}) as impressions,
        SUM(${googleSearchTerms.spend}) as spend
      from ${googleSearchTerms}
      where ${googleSearchTerms.sourceId} = ${accountId} and ${googleSearchTerms.integrationId} = ${integrationId} and ${googleSearchTerms.createdAt} >= ${since} and ${googleSearchTerms.createdAt} < ${until}
      group by ${googleSearchTerms.searchTerm}
      `
    );

    return (result[0] ?? []) as unknown as GoogleSearchTerm[];
  },
  getByAccountSince: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase
      .select()
      .from(googleSearchTerms)
      .where(
        and(
          eq(googleSearchTerms.sourceId, accountId),
          eq(googleSearchTerms.integrationId, integrationId),
          gte(googleSearchTerms.createdAt, since)
        )
      );

    return result;
  },
  createMany: async (newGoogleSearchTerms: NewGoogleSearchTerm[]) => {
    const result = await mysqlDatabase
      .insert(googleSearchTerms)
      .values(newGoogleSearchTerms)
      .onDuplicateKeyUpdate({
        set: {
          searchTerm: sql`values(search_term)`,
          adGroupId: sql`values(ad_group_id)`,
          sourceId: sql`values(source_id)`,
          integrationId: sql`values(integration_id)`,
          createdAt: sql`values(created_at)`,
          spend: sql`values(spend)`,
          ctr: sql`values(ctr)`,
          clicks: sql`values(clicks)`,
          impressions: sql`values(impressions)`,
        },
      });

    return result;
  },
};

export type GoogleSearchTermDao = typeof googleSearchTermDao;
