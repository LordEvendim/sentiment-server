import axios from "axios";
import { format, startOfYesterday, subDays, subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { metaInsightsMetricDao } from "#dao/metaInsightsMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { metaPageDao } from "#dao/metaPageDao";
import {
  MetaAdAccountDetails,
  MetaIntegration,
  MetaPageDetails,
  NewMetaInsightsMetric,
  NewMetaPage,
} from "#db/schema";
import { logger } from "#modules/logger";

import { metaGateway } from "./metaGateway";
import { GetUserPages, PageInsights } from "./types";
import { metaMetricPeriodToDays } from "./utils";

export class MetaInsights {
  apiVersion = "v20.0";
  baseUrl = "https://graph.facebook.com";

  pullLastDayData = async (userId: number) => {
    logger.debug(`Meta Insights: last day pull for user: ${userId}`);

    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration)
      throw new Error("Meta Insights: integration not connected");
    if (!integration.selectedPage)
      throw new Error("Meta Insights: page not selected");

    const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");

    const data = await this.getPageInsights(
      userId,
      integration.selectedPage,
      lastDay,
      lastDay
    );

    return data;
  };

  pullLastFourWeeks = async (userId: number) => {
    logger.debug(`Meta Insights: initial pull for ${userId}`);
    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration)
      throw new Error("Meta Insights: integration not connected");
    if (!integration.selectedPage)
      throw new Error("Meta Insights: page not selected");

    const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");
    const since = toZonedTime(subWeeks(lastDay, 4), "America/New_York");

    const data = await this.getPageInsights(
      userId,
      integration.selectedPage,
      since,
      lastDay
    );

    return data;
  };

  getPageInsights = async (
    userId: number,
    pageId: number,
    since: Date,
    until: Date
  ) => {
    logger.debug(
      `Meta Insights: getting page insights for ${userId} of ${pageId}`
    );

    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Meta Insights: user not connected");

    const pageAccessToken = await metaPageDao.getPageAccessToken(
      pageId,
      integration.id
    );
    const isPageOwner = await metaPageDao.isPageOwner(
      userId,
      integration.id,
      pageId
    );

    const metricsNames = [
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
    ];

    if (!isPageOwner) throw new Error("Meta Insights: user not a page owner");
    if (!pageAccessToken) throw new Error("Meta Insights: page not integrated");

    const result = await metaGateway.callBUC<PageInsights>({
      url: `${this.baseUrl}/${this.apiVersion}/${pageId}/insights`,
      config: {
        params: {
          metric: metricsNames.join(","),
          access_token: pageAccessToken,
          since: format(since, "yyyy-MM-dd"),
          until: format(until, "yyyy-MM-dd"),
          period: "day",
        },
      },
      userId: userId,
      businessId: pageId,
    });

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

    logger.debug(
      `Meta Insights: inserting facebook page insights metrics to DB`
    );
    if (metrics.length > 0) await metaInsightsMetricDao.createMany(metrics);

    return metrics;
  };

  getUserPages = async (userId: number) => {
    const userPages = await metaPageDao.getUserPages(userId);

    return userPages?.map((page) => ({
      name: page.name,
      id: page.pageId,
    }));
  };

  connectPages = async (userId: number) => {
    logger.debug(
      "Meta Insights: creating long lived page tokens for " + userId
    );

    const metaIntegration =
      await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!metaIntegration) throw new Error("Meta Insights: user not connected");

    const userAccessToken = metaIntegration.accessToken;
    const metaId = metaIntegration.metaId;

    const result = await axios.get<GetUserPages>(
      `${this.baseUrl}/${this.apiVersion}/${metaId}/accounts`,
      {
        params: {
          access_token: userAccessToken,
        },
      }
    );

    const transformedPages: NewMetaPage[] = result.data.data.map((page) => ({
      pageId: parseInt(page.id),
      accessToken: page.access_token,
      integrationId: metaIntegration.id,
      name: page.name,
    }));

    await metaPageDao.createMany(transformedPages);

    return result.data.data;
  };

  selectPage = async (userId: number, pageId: number) => {
    logger.debug(
      `Meta Insights: selecting Facebook Page for ${userId} to ${pageId}`
    );
    await metaIntegrationDao.updateByUserId(userId, {
      selectedPage: pageId,
    });

    this.pullLastFourWeeks(userId).catch((e) => logger.error(e));

    return pageId;
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
