import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { GoogleIntegration } from "#db/schema";

export class GoogleAnalytics {
  constructor() {}

  getUserIntegraiton = async (
    userId: number
  ): Promise<
    | Omit<GoogleIntegration, "refreshToken" | "tokenCreatedAt" | "ownerId">
    | undefined
  > => {
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) return undefined;

    return {
      id: integration.id,
      accessToken: integration.accessToken,
    };
  };
}

export const googleAnalytics = new GoogleAnalytics();
