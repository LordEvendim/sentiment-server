import { planetScaleDB } from "src/db/planetscale";

import { metaPages, NewMetaPage } from "#db/schema";

const metaPageDao = {
  create: async (newMetaPage: NewMetaPage) => {
    const result = await planetScaleDB.insert(metaPages).values(newMetaPage);

    return result;
  },
};

export type MetaPageDao = typeof metaPageDao;
