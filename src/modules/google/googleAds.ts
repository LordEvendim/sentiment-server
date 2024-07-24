import { format, parse, subDays, subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { enums, GoogleAdsApi } from "google-ads-api";

import { googleAdAccountDao } from "#dao/googleAdAccountDao";
import { googleAdAccountMetricDao } from "#dao/googleAdAccountMetricDao";
import { googleAdsCampaignMetricDao } from "#dao/googleAdsCampaignMetricDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import {
  NewGoogleAdAccount,
  NewGoogleAdAccountMetric,
  NewGoogleAdsCampaignMetric,
} from "#db/schema";
import { logger } from "#modules/logger";

import { BIDDING_STRATEGIES } from "./enum";
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

    const lastDay = subDays(toZonedTime(Date.now(), "America/New_York"), 1);

    await this.pullAccountMetrics(
      userId,
      integration.selectedAdAccount,
      lastDay,
      lastDay
    );

    await this.pullCampaigns(
      userId,
      integration.selectedAdAccount,
      lastDay,
      lastDay
    );
  };

  pullLastFourWeeks = async (userId: number) => {
    logger.debug("Google: pulling last four weeks");
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Google: integration not connected");
    if (!integration.selectedAdAccount)
      throw new Error("Google: ad account not selected");

    const lastDay = subDays(toZonedTime(Date.now(), "America/New_York"), 1);
    const since = toZonedTime(subWeeks(lastDay, 4), "America/New_York");

    await this.pullAccountMetrics(
      userId,
      integration.selectedAdAccount,
      since,
      lastDay
    );

    await this.pullCampaigns(
      userId,
      integration.selectedAdAccount,
      since,
      lastDay
    );
  };

  pullCampaigns = async (
    userId: number,
    propertyId: number,
    since: Date,
    until: Date
  ) => {
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Google Ads: Google is not integrated");
    if (!integration.refreshToken)
      throw new Error("Google Ads: Refresh token not present");
    if (!integration.selectedAdAccount)
      throw new Error("Google Ads: Ad Account not selected");

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ANALYTICS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ANALYTICS_CLIENT_SECRET!,
      developer_token: `${process.env.GOOGLE_ADS_DEVELOPER_TOKEN}`,
    });

    const customer = client.Customer({
      customer_id: propertyId.toString(),
      refresh_token: integration.refreshToken,
    });

    const campaigns = await customer.report({
      entity: "campaign",
      attributes: [
        "campaign.id",
        "campaign.name",
        "campaign.bidding_strategy_type",
        "campaign_budget.amount_micros",
      ],
      metrics: [
        "metrics.clicks",
        "metrics.impressions",
        "metrics.cost_micros",
        "metrics.unique_users",
      ],
      constraints: {
        "campaign.status": enums.CampaignStatus.ENABLED,
      },
      segments: ["segments.date"],
      from_date: format(since, "yyyy-MM-dd"),
      to_date: format(until, "yyyy-MM-dd"),
    });

    const transformedCampaigns: NewGoogleAdsCampaignMetric[] = campaigns.map(
      (datapoint) => {
        return {
          biddingStrategyType:
            BIDDING_STRATEGIES[
              datapoint.campaign!.bidding_strategy_type as number
            ],
          campaignId: datapoint.campaign!.id!.toString(),
          createdAt: parse(datapoint.segments!.date!, "yyyy-MM-dd", Date.now()),
          integrationId: integration.id,
          name: datapoint.campaign!.name!,
          period: 1,
          sourceId: integration.selectedAdAccount!,
          budget: datapoint.campaign_budget!.amount_micros! / 1_000_000,
          clicks: datapoint.metrics?.clicks,
          impressions: datapoint.metrics?.impressions,
          spend: datapoint.metrics!.cost_micros! / 1_000_000,
          uniqueUsers: datapoint.metrics!.unique_users,
        };
      }
    );

    if (transformedCampaigns.length > 0)
      await googleAdsCampaignMetricDao.createMany(transformedCampaigns);

    return campaigns;
  };

  pullAccountMetrics = async (
    userId: number,
    propertyId: number,
    since: Date,
    until: Date
  ) => {
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Google Ads: Google is not integrated");
    if (!integration.refreshToken)
      throw new Error("Google Ads: Refresh token not present");
    if (!integration.selectedAdAccount)
      throw new Error("Google Ads: Ad Account not selected");

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ANALYTICS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ANALYTICS_CLIENT_SECRET!,
      developer_token: `${process.env.GOOGLE_ADS_DEVELOPER_TOKEN}`,
    });

    const customer = client.Customer({
      customer_id: propertyId.toString(),
      refresh_token: integration.refreshToken,
    });

    const data = await customer.report({
      entity: "customer",
      metrics: [
        "metrics.cost_micros",
        "metrics.clicks",
        "metrics.impressions",
        "metrics.all_conversions",
        "metrics.average_cpc",
      ],
      segments: ["segments.date"],
      from_date: format(since, "yyyy-MM-dd"),
      to_date: format(until, "yyyy-MM-dd"),
    });

    const metrics: NewGoogleAdAccountMetric[] = [];

    for (let i = 0; i < data.length; i++) {
      const datapoint = data[i] as Record<string, number>;
      const date = parse(
        (datapoint.segments as unknown as { date: string }).date,
        "yyyy-MM-dd",
        Date.now()
      );

      for (const [key, value] of Object.entries(datapoint.metrics)) {
        const metricValue = ["cost_micros"].includes(key)
          ? value / 1_000_000
          : value;

        metrics.push({
          createdAt: date,
          integrationId: integration.id,
          metricId: key,
          period: 1,
          sourceId: integration.selectedAdAccount,
          value: metricValue,
        });
      }
    }

    if (metrics.length > 0) await googleAdAccountMetricDao.createMany(metrics);

    return metrics;
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

    this.pullLastFourWeeks(userId).catch((e) => logger.error(e));

    return accountId;
  };

  getTopCampaigns = async (userId: number, since: Date) => {
    logger.debug(`Google Ads: pulling top campaign for ${userId}`);

    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("User is not connected with Meta");
    if (!integration.selectedAdAccount)
      throw new Error("Google Ads: Ad account is not connected");

    const data = await googleAdsCampaignMetricDao.getTopCampaigns(
      integration.selectedAdAccount,
      integration.id,
      since
    );

    return data;
  };
}

export const googleAds = new GoogleAds();
