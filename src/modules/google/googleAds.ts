import { subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { googleAdAccountDao } from "#dao/googleAdAccountDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { NewGoogleAdAccount } from "#db/schema";
import { logger } from "#modules/logger";

import GoogleAuthLab from "./googleAuthLab";

export class GoogleAds {
  baseUrl = "https://googleads.googleapis.com/v16";

  constructor() {}

  pullLastDayData = async (userId: number) => {
    logger.debug("Google Ads: pulling last day data");
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Google Ads: integration not connected");
    if (!integration.selectedAdAccount)
      throw new Error("Google Ads: ad account not selected");

    const lastDay = toZonedTime(Date.now(), "America/New_York");

    const data = await this.pullAdGroupsData(
      userId,
      integration.selectedAdAccount,
      lastDay,
      lastDay
    );

    return data;
  };

  pullLastFourWeeks = async (userId: number) => {
    logger.debug("Google: pulling last four weeks");
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Google: integration not connected");
    if (!integration.selectedAdAccount)
      throw new Error("Google: ad account not selected");

    const lastDay = toZonedTime(Date.now(), "America/New_York");
    const since = toZonedTime(subWeeks(lastDay, 4), "America/New_York");

    const data = await this.pullAdGroupsData(
      userId,
      integration.selectedAdAccount,
      since,
      lastDay
    );

    return data;
  };

  pullAdGroupsData = async (
    userId: number,
    propertyId: number,
    since: Date,
    until: Date
  ) => {
    logger.debug(`Google: pulling AdGroup data for ${userId}`);
    logger.debug("since", since, until);
    const integration =
      await googleIntegrationDao.getIntegrationWithSelectedByUserId(userId);

    if (!integration) throw new Error("Google: integration not connected");

    if (!integration.accessToken) throw new Error("Google Ads is not connectd");

    const authLib = new GoogleAuthLab(userId);

    /**
     * this would load the tokens from the database refresh if needed
     */
    await authLib.loadTokens();

    const result = await authLib.request({
      url: `${this.baseUrl}/customers/${propertyId}/googleAds:search`,
      method: "POST",
      headers: {
        Host: "googleads.googleapis.com",
        "developer-token": `${process.env.GOOGLE_ADS_DEVELOPER_TOKEN}`,
      },
      params: {
        query:
          "SELECT ad_group_criterion.keyword.text, ad_group_criterion.status FROM ad_group_criterion WHERE ad_group_criterion.type = 'KEYWORD' AND ad_group_criterion.status = 'ENABLED'",
      },
    });
    return result;
  };

  getUserAccounts = async (userId: number) => {
    return await googleAdAccountDao.getUserAdAccounts(userId);
  };

  connectUserAccounts = async (userId: number) => {
    logger.debug(`Google: connecting Google Ads Accounts for ${userId}`);
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Google is not connected");
    if (!integration.accessToken) throw new Error("Google Ads is not connectd");

    const authLib = new GoogleAuthLab(userId);

    /**
     * this would load the tokens from the database refresh if needed
     */
    await authLib.loadTokens();

    try {
      const result = await authLib.request<{
        resourceNames: string[];
      }>({
        url: `${this.baseUrl}/customers:listAccessibleCustomers`,
        method: "GET",
        headers: {
          Host: "googleads.googleapis.com",
          "developer-token": `${process.env.GOOGLE_ADS_DEVELOPER_TOKEN}`,
        },
      });

      if (!result.data.resourceNames) return;

      const transformedAccounts = result.data.resourceNames.map(
        (accountId) => ({
          id: parseInt(accountId.split("/")[1]),
          integrationId: integration.id,
        })
      ) satisfies NewGoogleAdAccount[];

      await googleAdAccountDao.createMany(transformedAccounts);

      return transformedAccounts;
    } catch (error: unknown) {
      logger.error("Google Ads: failed to connect google ads accounts");
      logger.error(error);

      return [];
    }
  };

  selectAccount = async (userId: number, accountId: number) => {
    logger.debug(
      `Google: selecting Google Ad Account to ${accountId} for ${userId}`
    );
    await googleIntegrationDao.updateByUserId(userId, {
      selectedAdAccount: accountId,
    });

    return accountId;
  };
}

export const googleAds = new GoogleAds();
