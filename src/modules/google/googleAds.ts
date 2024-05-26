import axios from "axios";
import { subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { googleAdAccountDao } from "#dao/googleAdAccountDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { NewGoogleAdAccount } from "#db/schema";
import { logger } from "#modules/logger";

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
    logger.debug(`Google: getting weekly Google Ads Data for ${userId}`);
    const integration =
      await googleIntegrationDao.getIntegrationWithSelectedByUserId(userId);

    if (!integration) throw new Error("Google: integration not connected");

    if (!integration.accessToken) throw new Error("Google Ads is not connectd");

    // pull data from the api
    const result = await axios.post(
      `${this.baseUrl}/customers/${propertyId}/googleAds:search`,
      undefined,
      {
        headers: {
          Host: "googleads.googleapis.com",
          Authorization: `Bearer ${integration.accessToken}`,
          "developer-token": `${process.env.GOOGLE_ADS_DEVELOPER_TOKEN}`,
          // "login-customer-id": "", MANAGER ACCOUNT ID
        },
        params: {
          query:
            "SELECT ad_group_criterion.keyword.text, ad_group_criterion.status FROM ad_group_criterion WHERE ad_group_criterion.type = 'KEYWORD' AND ad_group_criterion.status = 'ENABLED'",
        },
      }
    );

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
    await googleIntegrationDao.updateByUserId(userId, {
      selectedAdAccount: accountId,
    });

    return accountId;
  };
}

export const googleAds = new GoogleAds();
