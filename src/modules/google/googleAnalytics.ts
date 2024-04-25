import axios from "axios";
import { format, parse, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { googleAnalyticsMetricDao } from "#dao/googleAnalyticsMetricDao";
import { googleAnalyticsPageDao } from "#dao/googleAnalyticsPageDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import {
  GoogleAnalyticsPage,
  GoogleIntegration,
  NewGoogleAnalyticsMetric,
} from "#db/schema";
import { logger } from "#modules/logger";

import {
  googleAnalyticsMetricsDetails,
  googleAnalyticsMetricsNames,
} from "./metrics";
import {
  GoogleAccount,
  GoogleAnalyticsReportInput,
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

    const data = await this.pullData(
      userId,
      integration.selectedPage,
      lastDay,
      lastDay
    );

    return data;
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
      accessToken: integration.accessToken,
      selectedPage: integration.selectedPage,
      selectedAdAccount: integration.selectedAdAccount,
    };
  };

  getUserAccounts = async (userId: number) => {
    return await googleAnalyticsPageDao.getUserPages(userId);
  };

  connectUserAccounts = async (userId: number) => {
    logger.debug(`Google: connecting Google Analytics accounts of ${userId}`);
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration?.accessToken) throw new Error("Google is not connected");

    const result = await axios.get<{ accounts: GoogleAccount[] }>(
      `${this.adminApiUrl}/accounts`,
      {
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
        },
      }
    );

    const properties: GoogleAnalyticsPage[] = [];

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
    const accessToken =
      await googleIntegrationDao.getAccessTokenByUserId(userId);

    const result = await axios.get<{ properties: GoogleProperty[] }>(
      `${this.adminApiUrl}/properties`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          filter: `ancestor:${accountName}`,
        },
      }
    );

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
    await googleIntegrationDao.update(userId, {
      selectedPage: pageId,
    });

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

    for (let i = 0; i < metrics.length; i += metricsBatchSize) {
      const result = await axios.post<GoogleAnalyticsReportOutput>(
        `${this.dataApiUrl}/properties/${selectedAnalyticsPage.id}:runReport`,
        {
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
        } satisfies GoogleAnalyticsReportInput,
        {
          headers: {
            Authorization: `Bearer ${integration.accessToken}`,
          },
        }
      );

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
    logger.debug(`Google: getting weekly Google Analytics Data for ${userId}`);
    const integration =
      await googleIntegrationDao.getIntegrationWithSelectedByUserId(userId);

    if (!integration) throw new Error("Google: integration not connected");

    if (!integration.accessToken)
      throw new Error("Google analytics is not connectd");

    const metrics = googleAnalyticsMetricsNames;

    const metricsBatchSize = 10;
    const metricsOuput: NewGoogleAnalyticsMetric[] = [];

    for (let i = 0; i < metrics.length; i += metricsBatchSize) {
      const result = await axios.post<GoogleAnalyticsReportOutput>(
        `${this.dataApiUrl}/properties/${propertyId}:runReport`,
        {
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
        } satisfies GoogleAnalyticsReportInput,
        {
          headers: {
            Authorization: `Bearer ${integration.accessToken}`,
          },
        }
      );

      if (!result.data.rows) return [];

      // Handle multiple rows for dimenssions
      const rows = result.data.rows.length ?? 0;

      for (let r = 0; r < rows; r++) {
        const rowDate = result.data.rows[r].dimensionValues[0].value;
        const formattedRowDate = parse(`${rowDate}Z`, "yyyyMMddX", new Date());

        for (let j = 0; j < result.data.rows[0].metricValues.length; j++) {
          metricsOuput.push({
            metricId: metrics[i + j],
            value: parseFloat(result.data.rows[0].metricValues[i].value),
            createdAt: formattedRowDate,
            integrationId: integration.id,
            period: 1,
            sourceId: propertyId,
          });
        }
      }
    }

    logger.debug(`Google: inserting google analytics metrics to DB`);
    await googleAnalyticsMetricDao.createMany(metricsOuput);

    return metricsOuput;
  };
}

export const googleAnalytics = new GoogleAnalytics();
