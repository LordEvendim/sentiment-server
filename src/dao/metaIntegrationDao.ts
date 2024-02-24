import { eq } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { integrations } from "#db/schema/integrations";
import {
  metaIntegrations,
  NewMetaIntegration,
} from "#db/schema/metaIntegrations";

const metaIntegrationDao = {
  getAccessTokenByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.integrations.findFirst({
      columns: {},
      with: {
        metaIntegration: true,
      },
      where: eq(integrations.ownerId, userId),
    });

    return result?.metaIntegration?.accessToken;
  },
  getMetaIntegrationByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.integrations.findFirst({
      columns: {},
      with: {
        metaIntegration: true,
      },
      where: eq(integrations.ownerId, userId),
    });

    return result?.metaIntegration;
  },
  create: async (newMetaIntegration: NewMetaIntegration) => {
    const result = await planetScaleDB
      .insert(metaIntegrations)
      .values(newMetaIntegration);

    return result;
  },
};

export type MetaIntegrationDao = typeof metaIntegrationDao;
