import { eachDayOfInterval, format, parse, subDays, subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { googleAnalyticsMetricDao } from "#dao/googleAnalyticsMetricDao";
import { googleAnalyticsPageDao } from "#dao/googleAnalyticsPageDao";
import { googleAnalyticsSourceDao } from "#dao/googleAnalyticsSourcesDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import {
  GoogleAnalyticsPage,
  GoogleIntegration,
  NewGoogleAnalyticsMetric,
} from "#db/schema";
import { NewGoogleAnalyticsSources } from "#db/schema/googleAnalyticsSources";
import { logger } from "#modules/logger";

import GoogleAuthLab from "./googleAuthLab";
import {
  googleAnalyticsMetricsDetails,
  googleAnalyticsMetricsNames,
} from "./metrics";
import {
  GoogleAccount,
  GoogleAnalyticsReportOutput,
  GoogleProperty,
} from "./types";

export class GoogleAnalytics {
  adminApiUrl = "https://analyticsadmin.googleapis.com/v1beta";
  dataApiUrl = "https://analyticsdata.googleapis.com/v1beta";

  constructor() {}

  pullLastDayData = async (userId: number) => {
    logger.debug(`Google: pulling last day data of ${userId}`);
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Google: integration not connected");
    if (!integration.selectedPage) throw new Error("Google: page not selected");

    const lastDay = subDays(toZonedTime(Date.now(), "America/New_York"), 1);

    await this.pullData(userId, integration.selectedPage, lastDay, lastDay);

    await this.pullSourcesData(
      userId,
      integration.selectedPage,
      lastDay,
      lastDay
    );
  };

  pullLastFourWeeks = async (userId: number) => {
    logger.debug("Google: pulling last four weeks");
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Google: integration not connected");
    if (!integration.selectedPage) throw new Error("Google: page not selected");

    const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");
    const since = toZonedTime(subWeeks(lastDay, 4), "America/New_York");

    await this.pullData(userId, integration.selectedPage, since, lastDay);

    await this.pullSourcesData(
      userId,
      integration.selectedPage,
      since,
      lastDay
    );
  };

  getUserIntegration = async (
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
      accessTokenExpiryDate: integration.accessTokenExpiryDate,
      accessToken: integration.accessToken,
      selectedPage: integration.selectedPage,
      selectedAdAccount: integration.selectedAdAccount,
    };
  };

  getUserAccounts = async (userId: number) => {
    return await googleAnalyticsPageDao.getUserPages(userId);
  };

  getSourcesData = async (userId: number, since: Date) => {
    logger.debug(`Google Ads: pulling top campaign for ${userId}`);

    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("User is not connected with Google");
    if (!integration.selectedPage)
      throw new Error("Google Analytics: Analytics page is not connected");

    const data = await googleAnalyticsSourceDao.getByAccountSinceGroupBySource(
      integration.selectedPage,
      integration.id,
      since
    );

    return data;
  };

  connectUserAccounts = async (userId: number) => {
    logger.debug(`Google: connecting Google Analytics accounts of ${userId}`);
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration?.accessToken) throw new Error("Google is not connected");

    const authLib = new GoogleAuthLab(userId);

    /**
     * this would load the tokens from the database refresh if needed
     */
    await authLib.loadTokens();

    const result = await authLib.request<{ accounts: GoogleAccount[] }>({
      method: "GET",
      url: `${this.adminApiUrl}/accounts`,
    });

    const properties: GoogleAnalyticsPage[] = [];

    if (!result.data.accounts) return;

    for (const account of result.data.accounts) {
      properties.push(
        ...(
          await this.connectAccountProperties(
            userId,
            account.name,
            account.displayName
          )
        ).map((element) => ({
          ...element,
          integrationId: integration.id,
        }))
      );
    }

    await googleAnalyticsPageDao.createMany(properties);

    return properties;
  };

  connectAccountProperties = async (
    userId: number,
    accountName: string,
    accountDisplayName: string
  ) => {
    logger.debug(`Google: connecting account properties of ${accountName}`);

    const authLib = new GoogleAuthLab(userId);

    await authLib.loadTokens();

    const result = await authLib.request<{ properties: GoogleProperty[] }>({
      method: "GET",
      url: `${this.adminApiUrl}/properties`,
      params: {
        filter: `ancestor:${accountName}`,
      },
    });

    const transformedProperties = result.data.properties.map((property) => ({
      id: parseInt(property.name.split("/")[1]),
      parentAccountName: accountDisplayName,
      name: property.displayName,
    }));

    return transformedProperties;
  };

  selectPage = async (userId: number, pageId: number) => {
    logger.debug(
      `Google: selecting Google Analytics Account to ${pageId} for ${userId}`
    );
    await googleIntegrationDao.updateByUserId(userId, {
      selectedPage: pageId,
    });

    this.pullLastFourWeeks(userId).catch((e) => logger.error(e));

    return pageId;
  };

  getWeeklyData = async (userId: number) => {
    logger.debug(`Google: getting weekly Google Analytics Data for ${userId}`);
    const integration =
      await googleIntegrationDao.getIntegrationWithSelectedByUserId(userId);

    const selectedAnalyticsPage = integration?.selectedPage;

    if (!selectedAnalyticsPage)
      throw new Error("Analytics Page is not connected");

    if (!integration.accessToken)
      throw new Error("Google analytics is not connectd");

    const metrics = googleAnalyticsMetricsNames;

    const metricsBatchSize = 10;
    const metricsOuput: {
      name: string;
      value: string;
    }[] = [];

    const authLib = new GoogleAuthLab(userId);

    await authLib.loadTokens();

    for (let i = 0; i < metrics.length; i += metricsBatchSize) {
      const result = await authLib.request<GoogleAnalyticsReportOutput>({
        method: "POST",
        url: `${this.dataApiUrl}/properties/${selectedAnalyticsPage.id}:runReport`,
        data: {
          dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
          dimensions: [
            {
              name: "sessionCampaignName",
            },
          ],
          metrics: [...metrics]
            .splice(i, i + metricsBatchSize)
            .map((metric) => ({
              name: metric,
            })),
        },
      });

      // Handle multiple rows for dimenssions
      if (result.data.rows) {
        for (let j = 0; j < result.data.rows[0].metricValues.length; j++) {
          metricsOuput.push({
            name: googleAnalyticsMetricsDetails[metrics[i + j]].displayName,
            value: result.data.rows[0].metricValues[i].value,
          });
        }
      }
    }

    return metricsOuput;
  };

  pullData = async (
    userId: number,
    propertyId: number,
    since: Date,
    until: Date
  ) => {
    logger.debug(`Google: getting Google Analytics Data for ${userId}`);
    const integration =
      await googleIntegrationDao.getIntegrationWithSelectedByUserId(userId);

    if (!integration) throw new Error("Google: integration not connected");

    if (!integration.accessToken)
      throw new Error("Google analytics is not connectd");

    const metrics = googleAnalyticsMetricsNames;

    const metricsBatchSize = 10;
    const metricsOuput: NewGoogleAnalyticsMetric[] = [];
    const pushedMetrics = new Set<string>();

    const authLib = new GoogleAuthLab(userId);

    await authLib.loadTokens();

    for (let i = 0; i < metrics.length; i += metricsBatchSize) {
      const result = await authLib.request<GoogleAnalyticsReportOutput>({
        method: "POST",
        url: `${this.dataApiUrl}/properties/${propertyId}:runReport`,
        data: {
          dateRanges: [
            {
              startDate: format(since, "yyyy-MM-dd"),
              endDate: format(until, "yyyy-MM-dd"),
            },
          ],
          dimensions: [
            {
              name: "date",
            },
          ],
          metrics: [...metrics]
            .splice(i, i + metricsBatchSize)
            .map((metric) => ({
              name: metric,
            })),
        },
      });

      if (!result.data.rows) result.data.rows = [];

      // Handle multiple rows for dimenssions
      const rows = result.data.rows.length ?? 0;

      for (let r = 0; r < rows; r++) {
        const rowDate = result.data.rows[r].dimensionValues[0].value;
        const formattedRowDate = parse(rowDate, "yyyyMMdd", new Date());

        for (let j = 0; j < result.data.rows[r].metricValues.length; j++) {
          pushedMetrics.add(
            metrics[i + j] + format(formattedRowDate, "yyyy-MM-dd")
          );
          metricsOuput.push({
            metricId: metrics[i + j],
            value: parseFloat(result.data.rows[r].metricValues[j].value),
            createdAt: formattedRowDate,
            integrationId: integration.id,
            period: 1,
            sourceId: propertyId,
          });
        }
      }
    }

    // fill gaps caused by missing metrics with zero value
    const days = eachDayOfInterval({
      start: since,
      end: until,
    });

    for (const day of days) {
      for (const metric of metrics) {
        if (pushedMetrics.has(metric + format(day, "yyyy-MM-dd"))) continue;

        metricsOuput.push({
          createdAt: day,
          integrationId: integration.id,
          metricId: metric,
          period: 1,
          sourceId: propertyId,
          value: 0,
        });
      }
    }

    logger.debug(`Google: inserting google analytics metrics to DB`);
    await googleAnalyticsMetricDao.createMany(metricsOuput);

    return metricsOuput;
  };

  pullSourcesData = async (
    userId: number,
    propertyId: number,
    since: Date,
    until: Date
  ) => {
    logger.debug(`Google: getting Google Analytics Data for ${userId}`);
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Google: integration not connected");
    if (!integration.accessToken)
      throw new Error("Google: access token not specified");

    const authLib = new GoogleAuthLab(userId);
    await authLib.loadTokens();

    const result = await authLib.request<GoogleAnalyticsReportOutput>({
      method: "POST",
      url: `${this.dataApiUrl}/properties/${propertyId}:runReport`,
      data: {
        dateRanges: [
          {
            startDate: format(since, "yyyy-MM-dd"),
            endDate: format(until, "yyyy-MM-dd"),
          },
        ],
        dimensions: [
          {
            name: "date",
          },
          {
            name: "source",
          },
        ],
        metrics: ["sessions"].map((metric) => ({
          name: metric,
        })),
      },
    });

    if (!result.data.rows) return [];

    const transformedSources = result.data.rows?.map(
      (datapoint) =>
        ({
          createdAt: parse(
            datapoint.dimensionValues[0].value,
            "yyyyMMdd",
            new Date()
          ),
          integrationId: integration.id,
          sessions: parseInt(datapoint.metricValues[0].value),
          source: datapoint.dimensionValues[1].value,
          sourceId: propertyId,
        }) satisfies NewGoogleAnalyticsSources
    );

    if (transformedSources.length > 0)
      await googleAnalyticsSourceDao.createMany(transformedSources);

    return transformedSources;
  };
}

export const googleAnalytics = new GoogleAnalytics();
