import axios from "axios";
import { pages, userPages, userTokens } from "./tempStorage";
import { GetLongLivedToken, GetUserAccounts } from "./types";
import { logger } from "#modules/logger";

class MetaAuth {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com";
  appSecret = "";
  appId = "";

  constructor() {
    this.appSecret = process.env.META_APP_SECRET ?? "";
    this.appId = process.env.META_APP_ID ?? "";
  }

  getLongLivedToken = async (userId: string, userAccessToken: string) => {
    if (userTokens[userId]) return userTokens[userId];

    const result = await axios.get<GetLongLivedToken>(
      `${this.baseUrl}/${this.apiVersion}/oauth/access_token`,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: this.appId,
          client_secret: this.appSecret,
          fb_exchange_token: userAccessToken,
        },
      }
    );

    userTokens[userId] = result.data.access_token;

    return result.data.access_token;
  };

  getLongLivedPageTokens = async (userId: string) => {
    const userAccessToken = userTokens[userId];

    const result = await axios.get<GetUserAccounts>(
      `${this.baseUrl}/${this.apiVersion}/${userId}/accounts`,
      {
        params: {
          access_token: userAccessToken,
        },
      }
    );

    for (let i = 0; i < result.data.data.length; i++) {
      const { id, access_token, name } = result.data.data[i];

      pages[id] = {
        accessToken: access_token,
        name,
      };
    }
    userPages[userId] = result.data.data.map((page) => page.id);

    return result.data.data;
  };
}

export const metaAuth = new MetaAuth();
