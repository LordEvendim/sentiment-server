import axios from "axios";
import { BreakdownOptions, SupportedBreakdownFields } from "./types";
import { pages, selectedUserPage, userPages, userTokens } from "./tempStorage";

export class MetaInsights {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com";
  accessToken = "";

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN ?? "";
  }

  getUserAccesToken = async (userId: string): Promise<string | undefined> => {
    return userTokens[userId];
  };

  getPageAccessToken = async (pageId: string): Promise<string | undefined> => {
    return pages[pageId].accessToken;
  };

  getBusinessAdAccounts = async (userId: string, businessId: string) => {
    const userAccessToken = await this.getUserAccesToken(userId);

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

  getBusinessClientAdAccounts = async (userId: string, businessId: string) => {
    const userAccessToken = await this.getUserAccesToken(userId);

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

  getUserBusinesses = async (userId: string) => {
    const userAccessToken = await this.getUserAccesToken(userId);

    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${userId}/businesses`,
      {
        params: {
          access_token: userAccessToken,
        },
      }
    );

    return result;
  };

  getPageInsights = async (pageId: string) => {
    const pageAccessToken = await this.getPageAccessToken(pageId);

    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${pageId}/insights`,
      {
        params: {
          metric: "page_impressions",
          access_token: pageAccessToken,
        },
      }
    );

    return result;
  };

  getAccounts = async (userId: string) => {
    const accounts = [];

    for (let i = 0; i < userPages[userId].length; i++) {
      const pageId = userPages[userId][i];
      const pageData = pages[pageId];

      if (!pageData) return undefined;

      accounts.push({
        name: pageData.name,
        id: pageId,
      });
    }

    return accounts;
  };

  getAdAccounts = async (userId: string) => {
    const userAccessToken = this.getUserAccesToken(userId);

    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${userId}/businesses`,
      {
        params: {
          access_token: userAccessToken,
        },
      }
    );

    return result;
  };

  getCampaignStatistics = async (
    userId: string,
    adCampaignId: string,
    breakdowns: BreakdownOptions[],
    fields: SupportedBreakdownFields[]
  ) => {
    const accessToken = this.getUserAccesToken(userId);

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

  selectPage = async (userId: string, pageId: string) => {
    if (!userPages[userId]) throw new Error("User doesn't have pages");

    if (userPages[userId].findIndex((page) => page === pageId) === -1) {
      throw new Error("User is not a page owner");
    }

    selectedUserPage[userId] = pageId;

    return pageId;
  };
}

export const metaInsights = new MetaInsights();
