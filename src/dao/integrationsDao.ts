import { eq } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import {
  Integration,
  integrations,
  NewIntegration,
} from "#db/schema/integrations";

const integrationDao = {
  getIntegrationByUserId: async (
    userId: number
  ): Promise<Integration | undefined> => {
    const result = await planetScaleDB.query.integrations.findFirst({
      where: eq(integrations.ownerId, userId),
    });

    return result;
  },
  create: async (newIntegration: NewIntegration) => {
    const result = await planetScaleDB
      .insert(integrations)
      .values(newIntegration);

    return result;
  },
};

export type IntegrationDao = typeof integrationDao;
