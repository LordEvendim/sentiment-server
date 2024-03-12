import axios from "axios";

import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { GoogleIntegration } from "#db/schema";

import { GoogleAccount } from "./types";

export class GoogleAnalytics {
  adminApiUrl = "https://analyticsadmin.googleapis.com/v1beta";

  constructor() {}

  getUserIntegraiton = async (
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
    };
  };

  getUserAccounts = async (userId: number) => {
    const accessToken =
      await googleIntegrationDao.getAccessTokenByUserId(userId);

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

    const result = await axios.get<{ accounts: GoogleAccount[] }>(
      `${this.adminApiUrl}/accounts`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const properties = [];

    for (const account of result.data.accounts) {
      properties.push(
        ...(await this.getAccountProperties(userId, account.name))
      );
    }

    return properties;
  };

  getAccountProperties = async (userId: number, accountName: string) => {
    const accessToken =
      await googleIntegrationDao.getAccessTokenByUserId(userId);

    const result = await axios.get(`${this.adminApiUrl}/properties`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        filter: `ancestor:${accountName}`,
      },
    });

    return result.data.properties;
  };
}

export const googleAnalytics = new GoogleAnalytics();
