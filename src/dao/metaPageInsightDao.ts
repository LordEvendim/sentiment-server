import { planetScaleDB } from "src/db/planetscale";

import { metaPageInsights, NewMetaPageInsight } from "#db/schema";

const metaPageInsightDao = {
  create: async (newMetaPageInsight: NewMetaPageInsight) => {
    const result = await planetScaleDB
      .insert(metaPageInsights)
      .values(newMetaPageInsight);

    return result;
  },
};

export type MetaPageInsightDao = typeof metaPageInsightDao;
