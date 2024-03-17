import axios from "axios";

import { googleAnalyticsPageDao } from "#dao/googleAnalyticsPageDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { GoogleAnalyticsPage, GoogleIntegration } from "#db/schema";

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
    };
  };

  getUserAccounts = async (userId: number) => {
    return await googleAnalyticsPageDao.getUserPages(userId);
  };

  connectUserAccounts = async (userId: number) => {
    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    // const oauthClient: Auth.OAuth2Client = new google.auth.OAuth2({
    //   credentials: {
    //     access_token: accessToken,
    //   },
    // });

    // const googleAdmin = google.analyticsadmin("v1beta");
    // const result = await googleAdmin.accounts.list({
    //   auth: oauthClient,
    // });

    // console.log(result.data);

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
    await googleIntegrationDao.update(userId, {
      selectedPage: pageId,
    });

    return pageId;
  };

  getWeeklyData = async (userId: number) => {
    const integration =
      await googleIntegrationDao.getIntegrationWithSelectedPageByUserId(userId);

    const selectedAnalyticsPage = integration?.selectedPage;

    if (!selectedAnalyticsPage)
      throw new Error("Analytics Page is not connected");

    if (!integration.accessToken)
      throw new Error("Google analytics is not connectd");

    const metrics = [
      "activeUsers",
      "bounceRate",
      "newUsers",
      "sessions",
      "engagementRate",
      "conversions",
      "cartToViewRate",
      "userConversionRate",
      "advertiserAdCostPerConversion",
      "sessionsPerUser",
      "addToCarts",
      "checkouts",
      "ecommercePurchases",
    ];

    const result = await axios.post<GoogleAnalyticsReportOutput>(
      `${this.dataApiUrl}/properties/${selectedAnalyticsPage.id}:runReport`,
      {
        dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
        dimensions: [
          {
            name: "sessionCampaignName",
          },
        ],
        metrics: [...metrics].splice(0, 10).map((metric) => ({
          name: metric,
        })),
      } satisfies GoogleAnalyticsReportInput,
      {
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
        },
      }
    );

    const result2 = await axios.post<GoogleAnalyticsReportOutput>(
      `${this.dataApiUrl}/properties/${selectedAnalyticsPage.id}:runReport`,
      {
        dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
        dimensions: [],
        metrics: [...metrics].splice(10, 10).map((metric) => ({
          name: metric,
        })),
      } satisfies GoogleAnalyticsReportInput,
      {
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
        },
      }
    );

    const metricsOuput: {
      name: string;
      value: string;
    }[] = [];

    if (result.data.rows) {
      for (let i = 0; i < result.data.rows[0].metricValues.length; i++) {
        metricsOuput.push({
          name: metrics[i],
          value: result.data.rows[0].metricValues[i].value,
        });
      }
    }

    if (result2.data.rows) {
      for (let i = 0; i < result2.data.rows[0].metricValues.length; i++) {
        metricsOuput.push({
          name: metrics[i + 10],
          value: result2.data.rows[0].metricValues[i].value,
        });
      }
    }

    return metricsOuput;
  };
}

export const googleAnalytics = new GoogleAnalytics();
