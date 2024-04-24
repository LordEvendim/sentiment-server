import axios from "axios";

import { googleAdAccountDao } from "#dao/googleAdAccountDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { NewGoogleAdAccount } from "#db/schema";
import { logger } from "#modules/logger";

export class GoogleAds {
  baseUrl = "https://googleads.googleapis.com/v16";

  constructor() {}

  getUserAccounts = async (userId: number) => {
    return await googleAdAccountDao.getUserAdAccounts(userId);
  };

  connectUserAccounts = async (userId: number) => {
    logger.debug(`Google: connecting Google Ads Accounts for ${userId}`);
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Google is not connected");

    const result = await axios.get<{
      resourceNames: string[];
    }>(`${this.baseUrl}/customers:listAccessibleCustomers`, {
      headers: {
        Host: "googleads.googleapis.com",
        Authorization: `Bearer ${integration.accessToken}`,
        "developer-token": `${process.env.GOOGLE_ADS_DEVELOPER_TOKEN}`,
      },
    });

    const transformedAccounts = result.data.resourceNames.map((accountId) => ({
      id: parseInt(accountId.split("/")[1]),
      integrationId: integration.id,
    })) satisfies NewGoogleAdAccount[];

    await googleAdAccountDao.createMany(transformedAccounts);

    return transformedAccounts;
  };

  selectAccount = async (userId: number, accountId: number) => {
    logger.debug(
      `Google: selecting Google Ad Account to ${accountId} for ${userId}`
    );
    await googleIntegrationDao.update(userId, {
      selectedAdAccount: accountId,
    });

    return accountId;
  };
}

export const googleAds = new GoogleAds();
