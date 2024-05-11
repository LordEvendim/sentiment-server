import { mysqlDatabase } from "#db/mysql";
import { metaApiUsage, NewMetaApiUsage } from "#db/schema";

export const metaApiUsageDao = {
  getLatest: async () => {
    const result = await mysqlDatabase.query.metaApiUsage.findMany({
      orderBy: (usage, { desc }) => [desc(usage.id)],
      limit: 10000,
    });

    return result;
  },
  create: async (record: NewMetaApiUsage) => {
    const result = await mysqlDatabase.insert(metaApiUsage).values(record);

    return result;
  },
};

export type MetaApiUsageDao = typeof metaApiUsageDao;
