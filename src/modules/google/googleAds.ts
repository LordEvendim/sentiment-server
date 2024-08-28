import { format, parse, subDays, subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { enums, GoogleAdsApi } from "google-ads-api";

import { googleAdAccountDao } from "#dao/googleAdAccountDao";
import { googleAdAccountMetricDao } from "#dao/googleAdAccountMetricDao";
import { googleAdsAdGroupDao } from "#dao/googleAdsAdGroupDao";
import { googleAdsCampaignMetricDao } from "#dao/googleAdsCampaignMetricDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { googleSearchTermDao } from "#dao/googleSearchTermDao";
import {
  NewGoogleAdAccount,
  NewGoogleAdAccountMetric,
  NewGoogleAdsCampaignMetric,
} from "#db/schema";
import { NewGoogleAdsAdGroup } from "#db/schema/googleAdsAdGroups";
import { NewGoogleSearchTerm } from "#db/schema/googleSearchTerms";
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

    await this.pullAdGroups(
      userId,
      integration.selectedAdAccount,
      lastDay,
      lastDay
    );

    await this.pullAdGroups(
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

    await this.pullAdGroups(
      userId,
      integration.selectedAdAccount,
      since,
      lastDay
    );

    await this.pullAdGroups(
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
        "campaign.status",
        "campaign.target_cpa.target_cpa_micros",
      ],
      metrics: [
        "metrics.clicks",
        "metrics.impressions",
        "metrics.cost_micros",
        "metrics.unique_users",
        "metrics.ctr",
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
            enums.BiddingStrategyType[
              datapoint.campaign!.bidding_strategy_type as number
            ],
          campaignId: datapoint.campaign!.id!.toString(),
          createdAt: parse(datapoint.segments!.date!, "yyyy-MM-dd", Date.now()),
          integrationId: integration.id,
          name: datapoint.campaign!.name!,
          period: 1,
          sourceId: integration.selectedAdAccount!,
          budget: (datapoint.campaign_budget?.amount_micros ?? 0) / 1_000_000,
          clicks: datapoint.metrics?.clicks,
          impressions: datapoint.metrics?.impressions,
          spend: (datapoint.metrics?.cost_micros ?? 0) / 1_000_000,
          uniqueUsers: datapoint.metrics?.unique_users,
          status: enums.CampaignStatus[datapoint.campaign?.status as number],
          ctr: datapoint.metrics?.ctr,
          targetCpa:
            (datapoint.campaign?.target_cpa?.target_cpa_micros ?? 0) /
            1_000_000,
        };
      }
    );

    if (transformedCampaigns.length > 0)
      await googleAdsCampaignMetricDao.createMany(transformedCampaigns);

    return transformedCampaigns;
  };

  pullAdGroups = async (
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

    const adGroups = await customer.report({
      entity: "ad_group",
      attributes: [
        "ad_group.id",
        "ad_group.name",
        "ad_group.status",
        "campaign.id",
      ],
      metrics: [
        "metrics.clicks",
        "metrics.impressions",
        "metrics.cost_micros",
        "metrics.ctr",
      ],
      constraints: {
        "ad_group.status": enums.AdGroupStatus.ENABLED,
      },
      segments: ["segments.date"],
      from_date: format(since, "yyyy-MM-dd"),
      to_date: format(until, "yyyy-MM-dd"),
    });

    const transformedAdGroups: NewGoogleAdsAdGroup[] = adGroups.map(
      (datapoint) => {
        return {
          createdAt: parse(datapoint.segments!.date!, "yyyy-MM-dd", Date.now()),
          integrationId: integration.id,
          sourceId: integration.selectedAdAccount!,
          adGroupId: datapoint.ad_group!.id!.toString(),
          name: datapoint.ad_group!.name!,
          status: enums.AdGroupStatus[datapoint.ad_group?.status as number],
          campaignId: datapoint.campaign!.id!.toString(),
          clicks: datapoint.metrics?.clicks,
          impressions: datapoint.metrics?.impressions,
          spend: (datapoint.metrics?.cost_micros ?? 0) / 1_000_000,
          ctr: datapoint.metrics?.ctr,
        } satisfies NewGoogleAdsAdGroup;
      }
    );

    if (transformedAdGroups.length > 0)
      await googleAdsAdGroupDao.createMany(transformedAdGroups);

    return adGroups;
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
        "metrics.conversions",
        // "metrics.conversions_value",
        "metrics.interactions",
        // "metrics.conversions_by_conversion_date",
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
        let metricValue = value;

        if (["cost_micros"].includes(key)) {
          metricValue = value / 1_000_000;
        }

        if (["conversions", "all_conversions"].includes(key)) {
          metricValue = Math.round(value);
        }

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

  pullSearchTerms = async (
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

    const searchTerms = await customer.report({
      entity: "search_term_view",
      attributes: ["search_term_view.search_term", "ad_group.id"],
      metrics: [
        "metrics.clicks",
        "metrics.impressions",
        "metrics.cost_micros",
        "metrics.ctr",
      ],
      constraints: {
        "search_term_view.status": enums.SearchTermTargetingStatus.ADDED,
      },
      segments: ["segments.date"],
      from_date: format(since, "yyyy-MM-dd"),
      to_date: format(until, "yyyy-MM-dd"),
    });

    const transformedSearchTerms: NewGoogleSearchTerm[] = searchTerms.map(
      (datapoint) => {
        return {
          searchTerm: datapoint.search_term_view!.search_term!,
          adGroupId: datapoint.ad_group!.id!.toString(),
          sourceId: integration.selectedAdAccount!,
          integrationId: integration.id,
          createdAt: parse(datapoint.segments!.date!, "yyyy-MM-dd", Date.now()),
          spend: (datapoint.metrics?.cost_micros ?? 0) / 1_000_000,
          ctr: datapoint.metrics?.ctr,
          clicks: datapoint.metrics?.clicks,
          impressions: datapoint.metrics?.impressions,
        };
      }
    );

    if (transformedSearchTerms.length > 0)
      await googleSearchTermDao.createMany(transformedSearchTerms);

    return transformedSearchTerms;
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

  getAdGroups = async (userId: number, since: Date) => {
    logger.debug(`Google Ads: pulling ad groups for ${userId}`);

    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("User is not connected with Meta");
    if (!integration.selectedAdAccount)
      throw new Error("Google Ads: Ad account is not connected");

    const data = await googleAdsAdGroupDao.getAdGroupsSummarySince(
      integration.selectedAdAccount,
      integration.id,
      since
    );

    return data;
  };

  getCampaigns = async (userId: number, since: Date, until: Date) => {
    logger.debug(`Google Ads: pulling campaign for ${userId}`);

    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("User is not connected with Meta");
    if (!integration.selectedAdAccount)
      throw new Error("Google Ads: Ad account is not connected");

    const data = await googleAdsCampaignMetricDao.getCampaignsSinceUntil(
      integration.selectedAdAccount,
      integration.id,
      since,
      until
    );

    return data;
  };

  pullCustomerName = async (userId: number, customerId: number) => {
    logger.debug(`Google Ads: pulling customer name for ${customerId}`);

    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration)
      throw new Error("Google Ads: User is not connected with Google");

    const authLib = new GoogleAuthLab(userId);
    await authLib.loadTokens();

    const baseUrl = "https://googleads.googleapis.com/v16";

    const result = await authLib.request<{
      results:
        | {
            customerClient: {
              resourceName: string;
              clientCustomer: string;
              level: string; // int
              timeZone: string;
              manager: boolean;
              descriptiveName: string;
              currencyCode: string;
              id: string; // int
            };
          }[]
        | undefined;
    }>({
      url: `${baseUrl}/customers/${customerId}/googleAds:search`,
      method: "POST",
      headers: {
        Host: "googleads.googleapis.com",
        "developer-token": `${process.env.GOOGLE_ADS_DEVELOPER_TOKEN}`,
      },
      data: {
        query:
          "SELECT customer_client.descriptive_name, customer_client.client_customer, customer_client.level, customer_client.manager, customer_client.descriptive_name, customer_client.currency_code, customer_client.time_zone, customer_client.id FROM customer_client WHERE customer_client.level <= 1",
      },
    });

    return result.data.results?.[0].customerClient;
  };
}

export const googleAds = new GoogleAds();
