import axios from "axios";
import { format, startOfYesterday } from "date-fns";

import { metaAdAccountDao } from "#dao/metaAdAccountDao";
import { metaInsightsMetricDao } from "#dao/metaInsightsMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { metaPageDao } from "#dao/metaPageDao";
import {
  MetaAdAccountDetails,
  MetaIntegration,
  MetaPageDetails,
  NewMetaInsightsMetric,
} from "#db/schema";
import { logger } from "#modules/logger";

import {
  BreakdownOptions,
  PageInsights,
  SupportedBreakdownFields,
} from "./types";
import { metaMetricPeriodToDays } from "./utils";

export class MetaInsights {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com";

  getUserAccesToken = async (userId: number) => {
    return await metaIntegrationDao.getAccessTokenByUserId(userId);
  };

  getBusinessAdAccounts = async (userId: number, businessId: string) => {
    logger.debug(
      `Meta: getting Meta business owned ad accounts of ${businessId} of ${userId}`
    );

    const userAccessToken =
      await metaIntegrationDao.getAccessTokenByUserId(userId);

    if (!userAccessToken) throw new Error("User is not connected with Meta");

    const result = await axios.get<{
      data: {
        account_id: string;
        id: string;
      }[];
    }>(`${this.baseUrl}/${this.apiVersion}/${businessId}/owned_ad_accounts`, {
      params: {
        access_token: userAccessToken,
      },
    });

    return result.data.data;
  };

  getBusinessClientAdAccounts = async (userId: number, businessId: string) => {
    logger.debug(
      `Meta: getting Meta business client ad accounts of ${businessId} of ${userId}`
    );
    const userAccessToken =
      await metaIntegrationDao.getAccessTokenByUserId(userId);

    if (!userAccessToken) throw new Error("User is not connected with Meta");

    const result = await axios.get<{
      data: {
        account_id: string;
        id: string;
      }[];
    }>(`${this.baseUrl}/${this.apiVersion}/${businessId}/client_ad_accounts`, {
      params: {
        access_token: userAccessToken,
      },
    });

    return result.data.data;
  };

  getUserBusinesses = async (userId: number) => {
    logger.debug(`Meta: getting user Meta businesses ${userId}`);
    const metaIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    if (!metaIntegration) throw new Error("User is not connected wiht Meta");

    const result = await axios.get<{
      data: {
        id: string;
        name: string;
      }[];
    }>(
      `${this.baseUrl}/${this.apiVersion}/${metaIntegration.metaId}/businesses`,
      {
        params: {
          access_token: metaIntegration.accessToken,
        },
      }
    );

    return result.data.data;
  };

  connectUserAdAccounts = async (userId: number) => {
    logger.debug(`Meta: connecting Meta Ad Accounts for ${userId}`);
    const businesses = await this.getUserBusinesses(userId);

    const metaIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    if (!metaIntegration) throw new Error("Meta is not integrated");

    const adAccounts = [];

    for (let i = 0; i < businesses.length; i++) {
      const businessAdAccounts = await this.getBusinessAdAccounts(
        userId,
        businesses[i].id
      );
      const businessClientAdAccounts = await this.getBusinessClientAdAccounts(
        userId,
        businesses[i].id
      );

      adAccounts.push(
        ...businessAdAccounts.map((account) => ({
          parentAccountName: businesses[i].name,
          ...account,
        })),
        ...businessClientAdAccounts.map((account) => ({
          parentAccountName: businesses[i].name,
          ...account,
        }))
      );
    }

    await metaAdAccountDao.createMany(
      adAccounts.map((account) => ({
        ...account,
        integrationId: metaIntegration.id,
        id: parseInt(account.account_id),
      }))
    );

    return adAccounts;
  };

  getCampaignStatistics = async (
    userId: number,
    adCampaignId: string,
    breakdowns: BreakdownOptions[],
    fields: SupportedBreakdownFields[]
  ) => {
    const accessToken = await metaIntegrationDao.getAccessTokenByUserId(userId);

    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${adCampaignId}/insights`,
      {
        data: {
          breakdowns: breakdowns.join(","),
          fields: fields.join(","),
          access_token: accessToken,
        },
      }
    );

    return result;
  };

  getPageInsights = async (
    userId: number,
    pageId: number,
    since: Date,
    until: Date
  ) => {
    logger.debug(`Meta: getting page insights for ${userId} of ${pageId}`);

    const integration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    if (!integration) throw new Error("User is not connected with Meta");

    const pageAccessToken = await metaPageDao.getPageAccessToken(
      pageId,
      integration.id
    );
    const isPageOwner = await metaPageDao.isPageOwner(
      userId,
      integration.id,
      pageId
    );

    if (!isPageOwner) throw new Error("User is not a page owner");
    if (!pageAccessToken) throw new Error("This page is not integrated");

    const result = await axios.get<PageInsights>(
      `${this.baseUrl}/${this.apiVersion}/${pageId}/insights`,
      {
        params: {
          metric: [
            "page_impressions",
            "page_impressions_unique",
            "page_impressions_organic_v2",
            "page_impressions_organic_unique_v2",
            "page_impressions_viral",
            "page_impressions_viral_unique",
            "page_impressions_by_age_gender_unique",
            "page_impressions_by_country_unique",
            "page_total_actions",
            "page_cta_clicks_logged_in_total",
            "page_cta_clicks_logged_in_unique",
            "page_call_phone_clicks_logged_in_unique",
            "page_post_engagements",
            "page_consumptions_unique",
            // "page_engaged_users",
            // "profile_likes",
          ].join(","),
          access_token: pageAccessToken,
          since: format(since, "yyyy-MM-dd"),
          until: format(until, "yyyy-MM-dd"),
          period: "day",
        },
      }
    );

    const metrics: NewMetaInsightsMetric[] = [];

    for (let i = 0; i < result.data.data.length; i++) {
      const metric = result.data.data[i];

      for (let j = 0; j < metric.values.length; j++) {
        const datapoint = metric.values[j];

        const value =
          // CTA metrics return "object" in "value" field instead of the number
          typeof datapoint.value === "object"
            ? Object.entries(datapoint.value as object)
                .map((entry) => entry[1])
                .reduce((sum, a) => sum + a, 0)
            : datapoint.value;

        metrics.push({
          sourceId: pageId,
          metricId: metric.name,
          integrationId: integration.id,
          createdAt:
            metric.period === "lifetime"
              ? startOfYesterday()
              : new Date(metric.values[j].end_time),
          value: value,
          period: metaMetricPeriodToDays[metric.period],
        });
      }
    }

    logger.debug(`Meta: inserting facebook page insights metrics to DB`);
    await metaInsightsMetricDao.createMany(metrics);

    return metrics;
  };

  getUserPages = async (userId: number) => {
    const userPages = await metaPageDao.getUserPages(userId);

    return userPages?.map((page) => ({
      name: page.name,
      id: page.pageId,
    }));
  };

  getUserAdAccounts = async (userId: number) => {
    const accounts = await metaAdAccountDao.getUserAdAccounts(userId);

    return accounts?.map((account) => ({
      id: account.id,
      parentAccountName: account.parentAccountName,
    }));
  };

  selectPage = async (userId: number, pageId: number) => {
    logger.debug(`Meta: selecting Facebook Page for ${userId} to ${pageId}`);
    await metaIntegrationDao.update(userId, {
      selectedPage: pageId,
    });

    return pageId;
  };

  selectAdAccount = async (userId: number, accountId: number) => {
    logger.debug(
      `Meta: selecting Meta Ad account for ${userId} to ${accountId}`
    );
    await metaIntegrationDao.update(userId, {
      selectedAdAccount: accountId,
    });

    return accountId;
  };

  getUserIntegration = async (
    userId: number
  ): Promise<
    | (Omit<MetaIntegration, "selectedPage" | "selectedAdAccount"> & {
        selectedPage?: MetaPageDetails;
        selectedAdAccount?: MetaAdAccountDetails;
      })
    | undefined
  > => {
    const integration =
      await metaIntegrationDao.getIntegrationWithSelectedByUserId(userId);

    if (!integration) return undefined;

    const transformedIntegration = {
      ...integration,
      selectedPage: integration.selectedPage
        ? {
            name: integration.selectedPage.name,
            pageId: integration.selectedPage.pageId,
            profilePictureURL: integration.selectedPage.name,
          }
        : undefined,
      selectedAdAccount: integration.selectedAdAccount
        ? {
            id: integration.selectedAdAccount.id,
            parentAccountName: integration.selectedAdAccount.parentAccountName,
          }
        : undefined,
    };

    return transformedIntegration;
  };
}

export const metaInsights = new MetaInsights();
