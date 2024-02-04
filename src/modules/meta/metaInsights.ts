import axios from "axios";
import { BreakdownOptions, SupportedBreakdownFields } from "./types";

class MetaInsights {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com/";
  accessToken = "";

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN ?? "";
  }

  getUserAccesToken = async (userId: string): Promise<string | undefined> => {
    return "";
  };

  getPageAccessToken = async (userId: string): Promise<string | undefined> => {
    return "";
  };

  getBusinessAdAccounts = async (userId: string, businessId: string) => {
    const userAccessToken = await this.getUserAccesToken(userId);

    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${businessId}/owned_ad_accounts`,
      {
        params: {
          accessToken: userAccessToken,
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
          accessToken: userAccessToken,
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
          accessToken: userAccessToken,
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
    const accessToken = await this.getUserAccesToken(userId);

    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${userId}/accounts`,
      {
        params: {
          accessToken,
        },
      }
    );

    return result;
  };

  getAdAccount = async (adCampaignId: string) => {
    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${adCampaignId}/insights`,
      {
        params: {},
      }
    );

    return result;
  };

  getCampaignStatistics = async (
    adCampaignId: string,
    breakdowns: BreakdownOptions[],
    fields: SupportedBreakdownFields[]
  ) => {
    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${adCampaignId}/insights`,
      {
        data: {
          breakdowns: breakdowns.join(","),
          fields: fields.join(","),
          access_token: this.accessToken,
        },
      }
    );

    return result;
  };
}

export const metaInsights = new MetaInsights();
