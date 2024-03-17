import axios from "axios";
import { startOfToday } from "date-fns";

import { metaAdAccountDao } from "#dao/metaAdAccountDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { metaPageDao } from "#dao/metaPageDao";
import { metaPageInsightDao } from "#dao/metaPageInsightDao";
import { metaPageInsightMetricDao } from "#dao/metaPageInsightMetricDao";
import {
  MetaAdAccountDetails,
  MetaIntegration,
  MetaPageDetails,
} from "#db/schema";
import { MetaPageInsightMetric } from "#db/schema/metaPageInsightMetrics";

import {
  BreakdownOptions,
  PageInsights,
  SupportedBreakdownFields,
} from "./types";

export class MetaInsights {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com";

  getUserAccesToken = async (userId: number) => {
    return await metaIntegrationDao.getAccessTokenByUserId(userId);
  };

  getPageAccessToken = async (pageId: number) => {
    return await metaPageDao.getPageAccessToken(pageId);
  };

  getBusinessAdAccounts = async (userId: number, businessId: string) => {
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

  getPageInsights = async (userId: number, pageId: number) => {
    const pageAccessToken = await metaPageDao.getPageAccessToken(pageId);
    const isPageOwner = await metaPageDao.isPageOwner(userId, pageId);

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
            "page_engaged_users",
            "page_post_engagements",
            "page_consumptions_unique",
            // "profile_likes",
          ].join(","),

          access_token: pageAccessToken,
        },
      }
    );

    const insert = await metaPageInsightDao.create({
      createdAt: Date.now(),
      pageId: pageId,
    });

    const metrics: Omit<MetaPageInsightMetric, "metricId">[] =
      result.data.data.map((metric) => {
        const valueField = metric?.values[1]?.value ?? metric.values[0].value;
        const value =
          typeof valueField === "object"
            ? Object.entries(metric.values[0].value as object)
                .map((entry) => entry[1])
                .reduce((sum, a) => sum + a, 0)
            : metric?.values[1]?.value ?? metric.values[0].value;

        return {
          insightId: parseInt(insert.insertId),
          description: metric.description,
          endTime: metric?.values[1]?.end_time ?? startOfToday().toISOString(),
          value: value,
          name: metric.name,
          period: metric.period,
          title: metric.title,
        };
      });

    await metaPageInsightMetricDao.createMany(metrics);

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
    await metaIntegrationDao.update(userId, {
      selectedPage: pageId,
    });

    return pageId;
  };

  selectAdAccount = async (userId: number, accountId: number) => {
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
