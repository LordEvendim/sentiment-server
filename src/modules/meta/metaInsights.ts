import axios from "axios";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { metaPageDao } from "#dao/metaPageDao";
import { metaPageInsightDao } from "#dao/metaPageInsightDao";
import { metaPageInsightMetricDao } from "#dao/metaPageInsightMetricDao";
import { MetaPageInsightMetric } from "#db/schema/metaPageInsightMetrics";

import {
  BreakdownOptions,
  PageInsights,
  SupportedBreakdownFields,
} from "./types";

export class MetaInsights {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com";
  accessToken = "";

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN ?? "";
  }

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

    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${businessId}/owned_ad_accounts`,
      {
        params: {
          access_token: userAccessToken,
        },
      }
    );

    return result;
  };

  getBusinessClientAdAccounts = async (userId: number, businessId: string) => {
    const userAccessToken =
      await metaIntegrationDao.getAccessTokenByUserId(userId);

    if (!userAccessToken) throw new Error("User is not connected with Meta");

    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${businessId}/client_ad_accounts`,
      {
        params: {
          access_token: userAccessToken,
        },
      }
    );

    return result;
  };

  getUserBusinesses = async (userId: number) => {
    const metaIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    if (!metaIntegration) throw new Error("User is not connected wiht Meta");

    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${metaIntegration.metaId}/businesses`,
      {
        params: {
          access_token: metaIntegration.accessToken,
        },
      }
    );

    return result;
  };

  getPageInsights = async (userId: number, pageId: number) => {
    const pageAccessToken =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    const result = await axios.get<PageInsights>(
      `${this.baseUrl}/${this.apiVersion}/${pageId}/insights`,
      {
        params: {
          metric:
            "page_impressions,page_posts_impressions,post_engaged_users,page_views_total",
          access_token: pageAccessToken,
        },
      }
    );

    const insert = await metaPageInsightDao.create({
      createdAt: Date.now(),
      pageId: pageId,
    });

    const metrics: Omit<MetaPageInsightMetric, "metricId">[] =
      result.data.data.map((metric) => ({
        insightId: parseInt(insert.insertId),
        description: metric.description,
        endTime: metric.values[1].end_time,
        value: metric.values[1].value,
        name: metric.name,
        period: metric.period,
        title: metric.title,
      }));

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

  getAdAccounts = async (userId: number) => {
    const metaIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    if (!metaIntegration) throw new Error("User is not connected wiht Meta");

    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${metaIntegration.metaId}/businesses`,
      {
        params: {
          access_token: metaIntegration.accessToken,
        },
      }
    );

    return result;
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

  selectPage = async (userId: number, pageId: number) => {
    await metaIntegrationDao.update(userId, {
      selectedPage: pageId,
    });

    return pageId;
  };
}

export const metaInsights = new MetaInsights();
